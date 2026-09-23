namespace UMS.Api.DTOs.Questionnaires;

public class QuestionnaireResponse
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int CourseOfferingId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<QuestionnaireQuestionResponse> Questions { get; set; } = [];
}
