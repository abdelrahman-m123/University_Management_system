using UMS.Api.Models;

namespace UMS.Api.Repositories.QuestionnaireQuestions;

public interface IQuestionnaireQuestionRepository
{
    Task<QuestionnaireQuestion?> GetByIdAsync(int id);
    Task AddAsync(QuestionnaireQuestion question);
    void Remove(QuestionnaireQuestion question);
}
