using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Announcements;

public class UpdateCommentRequest
{
    [Required]
    [StringLength(1000)]
    public string Content { get; set; } = string.Empty;
}
