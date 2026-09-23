namespace UMS.Api.DTOs.Announcements;

public class AnnouncementResponse
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int CourseOfferingId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorEmail { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<CommentResponse> Comments { get; set; } = [];
}
