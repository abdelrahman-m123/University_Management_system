namespace UMS.Api.Models;

public class QuizGrade
{
    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public int StudentId { get; set; }
    public StudentProfile Student { get; set; } = null!;

    public int Grade { get; set; }
    public DateTime GradedAt { get; set; } = DateTime.UtcNow;
}
