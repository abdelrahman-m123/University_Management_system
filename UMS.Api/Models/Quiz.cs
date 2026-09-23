namespace UMS.Api.Models;

public class Quiz
{
    public int Id { get; set; }
    public int CourseOfferingId { get; set; }
    public CourseOffering CourseOffering { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string? GoogleFormUrl { get; set; }
    public int MaxGrade { get; set; } = 10;
    public DateTime? OpensAt { get; set; }
    public DateTime? ClosesAt { get; set; }
    public bool IsVisible { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<QuizGrade> Grades { get; set; } = [];
}
