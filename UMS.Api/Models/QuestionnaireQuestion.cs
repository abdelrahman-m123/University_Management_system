namespace UMS.Api.Models;

public class QuestionnaireQuestion
{
    public int Id { get; set; }
    public int QuestionnaireId { get; set; }
    public Questionnaire Questionnaire { get; set; } = null!;

    public string Text { get; set; } = string.Empty;
    public bool IsRequired { get; set; } = true;
}
