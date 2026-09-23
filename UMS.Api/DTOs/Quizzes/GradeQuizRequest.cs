using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Quizzes;

public class GradeQuizRequest
{
    [Required]
    public int StudentId { get; set; }

    [Range(0, 100)]
    public int Grade { get; set; }
}
