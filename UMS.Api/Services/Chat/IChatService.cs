using UMS.Api.DTOs.Chats;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Chat;

public interface IChatService
{
    Task<ServiceResult<List<GetChatsResponse>>> GetMessagesByChattersIdsAsync(int doctorId, int studentId);
    Task<ServiceResult<GetChatsResponse>> SendMessageAsync(SendMessageRequest request);
    Task<ServiceResult<List<ChatUnreadResponse>>> GetUnreadChatsAsync();
    Task<ServiceResult<bool>> MarkMessagesAsReadAsync(int doctorId, int studentId);
}
