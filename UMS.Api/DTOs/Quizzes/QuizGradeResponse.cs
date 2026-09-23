namespace UMS.Api.DTOs.Quizzes;

public class QuizGradeResponse
{
    public int QuizId { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public int Grade { get; set; }
    public DateTime GradedAt { get; set; }
}
