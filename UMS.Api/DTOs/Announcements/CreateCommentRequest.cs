using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Announcements;

public class CreateCommentRequest
{
    [Required]
    public int AuthorId { get; set; }

    [Required]
    [StringLength(1000)]
    public string Content { get; set; } = string.Empty;
}
