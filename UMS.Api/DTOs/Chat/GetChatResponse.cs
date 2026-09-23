namespace UMS.Api.DTOs.Chats;

public class GetChatsResponse
{
    public int Id { get; set; }
    public int ChatId { get; set; }
    public int DoctorId { get; set; }
    public int StudentId { get; set; }
    public int SenderId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime TimeStamp { get; set; }
}
