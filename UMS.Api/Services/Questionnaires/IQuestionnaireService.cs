using UMS.Api.DTOs.Questionnaires;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Questionnaires;

public interface IQuestionnaireService
{
    Task<List<QuestionnaireResponse>> GetByCourseIdAsync(int courseId);
    Task<ServiceResult<QuestionnaireResponse>> CreateAsync(CreateQuestionnaireRequest request);
    Task<ServiceResult<object>> DeleteAsync(int id);
}
