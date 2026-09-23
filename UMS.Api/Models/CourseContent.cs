namespace UMS.Api.Models;

public class CourseContent
{
    public int Id { get; set; }
    public int CourseOfferingId { get; set; }
    public CourseOffering CourseOffering { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public byte[] FileData { get; set; } = [];
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
