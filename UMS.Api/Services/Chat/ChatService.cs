using UMS.Api.DTOs.Chats;
using UMS.Api.Hubs;
using UMS.Api.Models;
using Microsoft.AspNetCore.SignalR;
using UMS.Api.Repositories.Chat;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.Users;
using UMS.Api.Services.Common;
using UMS.Api.Services.CurrentUser;
using ChatEntity = UMS.Api.Models.Chat;

namespace UMS.Api.Services.Chat;

public class ChatService(
    IChatRepository chats,
    IUserRepository users,
    ICurrentUserService currentUser,
    IUnitOfWork unitOfWork,
    IHubContext<ChatHub> chatHub) : IChatService
{
    public async Task<ServiceResult<List<GetChatsResponse>>> GetMessagesByChattersIdsAsync(int doctorId, int studentId)
    {
        var participants = await ValidateParticipantsAsync(doctorId, studentId);
        if (!participants.IsSuccess)
        {
            return ServiceResult<List<GetChatsResponse>>.Failure(participants.Status, participants.Message);
        }

        var messages = await chats.GetMessagesByChattersIdsAsync(doctorId, studentId);

        return ServiceResult<List<GetChatsResponse>>.Success(
            messages.Select(ToResponse).ToList(),
            "Messages retrieved successfully");
    }

    public async Task<ServiceResult<GetChatsResponse>> SendMessageAsync(SendMessageRequest request)
    {
        var participants = await ValidateParticipantsAsync(request.DoctorId, request.StudentId);
        if (!participants.IsSuccess)
        {
            return ServiceResult<GetChatsResponse>.Failure(participants.Status, participants.Message);
        }

        var content = request.Content.Trim();
        if (content.Length == 0)
        {
            return ServiceResult<GetChatsResponse>.Failure(
                ResultStatus.ValidationError,
                "Message content is required");
        }

        if (content.Length > 2000)
        {
            return ServiceResult<GetChatsResponse>.Failure(
                ResultStatus.ValidationError,
                "Message content cannot exceed 2000 characters");
        }

        var chat = await chats.GetByChattersIdsAsync(request.DoctorId, request.StudentId);
        if (chat is null)
        {
            chat = new ChatEntity
            {
                DoctorId = request.DoctorId,
                StudentId = request.StudentId
            };

            await chats.AddAsync(chat);
        }

        var message = new Message
        {
            Chat = chat,
            SenderId = currentUser.UserId!.Value,
            Content = content,
            SentAt = DateTime.UtcNow
        };

        await chats.AddMessageAsync(message);
        await unitOfWork.SaveChangesAsync();

        var response = ToResponse(message);
        await chatHub.Clients
            .Group(ChatHub.GetGroupName(request.DoctorId, request.StudentId))
            .SendAsync("MessageReceived", response);

        var senderId = currentUser.UserId!.Value;
        var recipientId = senderId == request.DoctorId ? request.StudentId : request.DoctorId;
        var unreadCount = await chats.GetUnreadCountByChattersIdsAsync(
            request.DoctorId,
            request.StudentId,
            recipientId);
        var totalUnreadCount = (await chats.GetUnreadChatsAsync(recipientId))
            .Sum(chat => chat.UnreadCount);

        await chatHub.Clients
            .Group(ChatHub.GetUserGroupName(recipientId))
            .SendAsync("UnreadCountChanged", new
            {
                chatId = response.ChatId,
                doctorId = request.DoctorId,
                studentId = request.StudentId,
                unreadCount,
                totalUnreadCount
            });

        return ServiceResult<GetChatsResponse>.Success(response, "Message sent successfully");
    }

    public async Task<ServiceResult<List<ChatUnreadResponse>>> GetUnreadChatsAsync()
    {
        var userId = currentUser.UserId;
        if (userId is null)
        {
            return ServiceResult<List<ChatUnreadResponse>>.Failure(
                ResultStatus.Unauthorized,
                "The current user could not be identified");
        }

        return ServiceResult<List<ChatUnreadResponse>>.Success(
            await chats.GetUnreadChatsAsync(userId.Value),
            "Unread chats retrieved successfully");
    }

    public async Task<ServiceResult<bool>> MarkMessagesAsReadAsync(int doctorId, int studentId)
    {
        var participants = await ValidateParticipantsAsync(doctorId, studentId);
        if (!participants.IsSuccess)
        {
            return ServiceResult<bool>.Failure(participants.Status, participants.Message);
        }

        var userId = currentUser.UserId!.Value;
        var messages = await chats.GetUnreadMessagesByChattersIdsAsync(doctorId, studentId, userId);
        if (messages.Count > 0)
        {
            var readAt = DateTime.UtcNow;
            foreach (var message in messages)
            {
                message.ReadAt = readAt;
            }

            await unitOfWork.SaveChangesAsync();
        }

        var totalUnreadCount = (await chats.GetUnreadChatsAsync(userId))
            .Sum(chat => chat.UnreadCount);

        await chatHub.Clients
            .Group(ChatHub.GetUserGroupName(userId))
            .SendAsync("UnreadCountChanged", new
            {
                chatId = messages.FirstOrDefault()?.ChatId ?? 0,
                doctorId,
                studentId,
                unreadCount = 0,
                totalUnreadCount
            });

        return ServiceResult<bool>.Success(true, "Messages marked as read");
    }

    private async Task<ServiceResult<ChatParticipants>> ValidateParticipantsAsync(int doctorId, int studentId)
    {
        if (doctorId == studentId)
        {
            return ServiceResult<ChatParticipants>.Failure(
                ResultStatus.ValidationError,
                "A doctor and student must be different users");
        }

        var currentUserId = currentUser.UserId;
        if (currentUserId is null)
        {
            return ServiceResult<ChatParticipants>.Failure(
                ResultStatus.Unauthorized,
                "The current user could not be identified");
        }

        var doctor = await users.GetByIdWithRolesAsync(doctorId);
        if (doctor is null || !HasRole(doctor, AppRoles.Doctor))
        {
            return ServiceResult<ChatParticipants>.Failure(ResultStatus.NotFound, "Doctor not found");
        }

        var student = await users.GetByIdWithRolesAsync(studentId);
        if (student is null || !HasRole(student, AppRoles.Student))
        {
            return ServiceResult<ChatParticipants>.Failure(ResultStatus.NotFound, "Student not found");
        }

        var isStudent = currentUser.IsInRole(AppRoles.Student);
        var isDoctor = currentUser.IsInRole(AppRoles.Doctor);
        var isParticipant = (isStudent && currentUserId == studentId) ||
                            (isDoctor && currentUserId == doctorId);

        if (!isParticipant)
        {
            return ServiceResult<ChatParticipants>.Failure(
                ResultStatus.Forbidden,
                "You can only access chats you participate in");
        }

        return ServiceResult<ChatParticipants>.Success(
            new ChatParticipants(doctor, student),
            "Chat participants validated");
    }

    private static bool HasRole(User user, string role)
    {
        return user.UserRoles.Any(userRole => userRole.Role.Name == role);
    }

    private static GetChatsResponse ToResponse(Message message)
    {
        return new GetChatsResponse
        {
            Id = message.Id,
            ChatId = message.ChatId,
            DoctorId = message.Chat.DoctorId,
            StudentId = message.Chat.StudentId,
            SenderId = message.SenderId,
            Message = message.Content,
            TimeStamp = message.SentAt
        };
    }

    private sealed record ChatParticipants(User Doctor, User Student);
}
