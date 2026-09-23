using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Announcements;

public class CreateAnnouncementRequest
{
    [Required]
    public int CourseOfferingId { get; set; }

    [Required]
    public int AuthorId { get; set; }

    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(1000)]
    public string Content { get; set; } = string.Empty;
}
