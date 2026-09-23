namespace UMS.Api.Models;

public class Questionnaire
{
    public int Id { get; set; }
    public int CourseOfferingId { get; set; }
    public CourseOffering CourseOffering { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<QuestionnaireQuestion> Questions { get; set; } = [];
}
