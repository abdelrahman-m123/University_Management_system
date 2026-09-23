namespace UMS.Api.DTOs.Questionnaires;

public class QuestionnaireQuestionResponse
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
}
