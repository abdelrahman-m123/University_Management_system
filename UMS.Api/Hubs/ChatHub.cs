using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using UMS.Api.Models;

namespace UMS.Api.Hubs;

[Authorize(Roles = $"{AppRoles.Student},{AppRoles.Doctor}")]
public sealed class ChatHub : Hub
{
    public static string GetUserGroupName(int userId)
    {
        return $"user:{userId}";
    }

    public static string GetGroupName(int doctorId, int studentId)
    {
        return $"chat:{doctorId}:{studentId}";
    }

    public async Task JoinChat(int doctorId, int studentId)
    {
        EnsureParticipant(doctorId, studentId);
        await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(doctorId, studentId));
    }

    public async Task LeaveChat(int doctorId, int studentId)
    {
        EnsureParticipant(doctorId, studentId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupName(doctorId, studentId));
    }

    public override async Task OnConnectedAsync()
    {
        var currentUserId = Context.User?.FindFirstValue("userId");
        if (int.TryParse(currentUserId, out var userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetUserGroupName(userId));
        }

        await base.OnConnectedAsync();
    }

    private void EnsureParticipant(int doctorId, int studentId)
    {
        if (doctorId == studentId)
        {
            throw new HubException("A doctor and student must be different users");
        }

        var currentUserId = Context.User?.FindFirstValue("userId");
        var isStudent = Context.User?.IsInRole(AppRoles.Student) == true;
        var isDoctor = Context.User?.IsInRole(AppRoles.Doctor) == true;

        var isParticipant = (isStudent && currentUserId == studentId.ToString()) ||
                            (isDoctor && currentUserId == doctorId.ToString());

        if (!isParticipant)
        {
            throw new HubException("You can only join chats you participate in");
        }
    }
}
