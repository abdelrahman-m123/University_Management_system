namespace UMS.Api.DTOs.Quizzes;

public class QuizResponse
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int CourseOfferingId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? GoogleFormUrl { get; set; }
    public int MaxGrade { get; set; }
    public DateTime? OpensAt { get; set; }
    public DateTime? ClosesAt { get; set; }
    public bool IsVisible { get; set; }
    public DateTime CreatedAt { get; set; }
}
