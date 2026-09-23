namespace UMS.Api.DTOs.Chats;

public class SendMessageRequest
{
    public int DoctorId { get; set; }
    public int StudentId { get; set; }
    public string Content { get; set; } = string.Empty;
}
