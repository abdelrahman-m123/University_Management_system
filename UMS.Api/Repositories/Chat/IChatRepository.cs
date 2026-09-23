using UMS.Api.Models;
using UMS.Api.DTOs.Chats;
using ChatEntity = UMS.Api.Models.Chat;

namespace UMS.Api.Repositories.Chat;

public interface IChatRepository
{
    Task<ChatEntity?> GetByChattersIdsAsync(int doctorId, int studentId);
    Task<List<Message>> GetMessagesByChattersIdsAsync(int doctorId, int studentId);
    Task<List<ChatUnreadResponse>> GetUnreadChatsAsync(int userId);
    Task<int> GetUnreadCountByChattersIdsAsync(int doctorId, int studentId, int userId);
    Task<List<Message>> GetUnreadMessagesByChattersIdsAsync(int doctorId, int studentId, int userId);
    Task AddAsync(ChatEntity chat);
    Task AddMessageAsync(Message message);
}
