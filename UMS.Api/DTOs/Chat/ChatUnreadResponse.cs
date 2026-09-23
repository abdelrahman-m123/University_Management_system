namespace UMS.Api.DTOs.Chats;

public class ChatUnreadResponse
{
    public int ChatId { get; set; }
    public int DoctorId { get; set; }
    public int StudentId { get; set; }
    public int UnreadCount { get; set; }
}
