using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Quizzes;

public class UpdateQuizRequest
{
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    [StringLength(500)]
    public string? GoogleFormUrl { get; set; }

    [Range(1, 100)]
    public int MaxGrade { get; set; } = 10;

    public DateTime? OpensAt { get; set; }
    public DateTime? ClosesAt { get; set; }
    public bool IsVisible { get; set; }
}
