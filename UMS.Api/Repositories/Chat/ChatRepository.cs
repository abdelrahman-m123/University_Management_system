using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.DTOs.Chats;
using UMS.Api.Models;
using ChatEntity = UMS.Api.Models.Chat;


namespace UMS.Api.Repositories.Chat;

public class ChatRepository(ApplicationDbContext db) : IChatRepository
{
    public Task<ChatEntity?> GetByChattersIdsAsync(int doctorId, int studentId)
    {
        return db.Chats
            .SingleOrDefaultAsync(chat => chat.DoctorId == doctorId && chat.StudentId == studentId);
    }

    public async Task<List<Message>> GetMessagesByChattersIdsAsync(int doctorId, int studentId)
    {
        var chat = await GetByChattersIdsAsync(doctorId, studentId);
        if (chat is null)
        {
            return [];
        }

        return await db.Messages
            .Include(message => message.Chat)
            .Where(message => message.ChatId == chat.Id)
            .OrderBy(message => message.SentAt)
            .ToListAsync();
    }

    public Task<List<ChatUnreadResponse>> GetUnreadChatsAsync(int userId)
    {
        return db.Messages
            .Where(message =>
                message.ReadAt == null &&
                message.SenderId != userId &&
                (message.Chat.DoctorId == userId || message.Chat.StudentId == userId))
            .GroupBy(message => new
            {
                message.ChatId,
                message.Chat.DoctorId,
                message.Chat.StudentId
            })
            .Select(group => new ChatUnreadResponse
            {
                ChatId = group.Key.ChatId,
                DoctorId = group.Key.DoctorId,
                StudentId = group.Key.StudentId,
                UnreadCount = group.Count()
            })
            .ToListAsync();
    }

    public Task<int> GetUnreadCountByChattersIdsAsync(int doctorId, int studentId, int userId)
    {
        return db.Messages.CountAsync(message =>
            message.ReadAt == null &&
            message.SenderId != userId &&
            message.Chat.DoctorId == doctorId &&
            message.Chat.StudentId == studentId);
    }

    public Task<List<Message>> GetUnreadMessagesByChattersIdsAsync(int doctorId, int studentId, int userId)
    {
        return db.Messages
            .Where(message =>
                message.ReadAt == null &&
                message.SenderId != userId &&
                message.Chat.DoctorId == doctorId &&
                message.Chat.StudentId == studentId)
            .ToListAsync();
    }

    public async Task AddAsync(ChatEntity chat)
    {
        await db.Chats.AddAsync(chat);
    }

    public async Task AddMessageAsync(Message message)
    {
        await db.Messages.AddAsync(message);
    }
}
