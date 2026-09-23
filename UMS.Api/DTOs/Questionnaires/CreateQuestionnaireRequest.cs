using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Questionnaires;

public class CreateQuestionnaireRequest
{
    [Required]
    public int CourseOfferingId { get; set; }

    [Required]
    [MinLength(1)]
    public List<CreateQuestionnaireQuestionRequest> Questions { get; set; } = [];
}
