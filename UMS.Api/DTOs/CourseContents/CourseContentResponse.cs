namespace UMS.Api.DTOs.CourseContents;

public class CourseContentResponse
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int CourseOfferingId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
}
