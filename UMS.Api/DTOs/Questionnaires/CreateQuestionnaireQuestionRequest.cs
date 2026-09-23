using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Questionnaires;

public class CreateQuestionnaireQuestionRequest
{
    [Required]
    [StringLength(1000)]
    public string Text { get; set; } = string.Empty;

    public bool IsRequired { get; set; } = true;
}
