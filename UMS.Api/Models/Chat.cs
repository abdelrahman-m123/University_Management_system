namespace UMS.Api.Models;

public class Chat
{
    public int Id { get; set; }

    public int DoctorId { get; set; }
    public User Doctor { get; set; } = null!;

    public int StudentId { get; set; }
    public User Student { get; set; } = null!;

    public ICollection<Message> Messages { get; set; } = [];
}
