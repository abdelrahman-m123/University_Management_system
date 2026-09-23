namespace UMS.Api.Models;

public class Announcement
{
    public int Id { get; set; }
    public int CourseOfferingId { get; set; }
    public CourseOffering CourseOffering { get; set; } = null!;

    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Comment> Comments { get; set; } = [];
}
