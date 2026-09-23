namespace UMS.Api.Models;

public class Comment
{
    public int Id { get; set; }
    public int AnnouncementId { get; set; }
    public Announcement Announcement { get; set; } = null!;

    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
