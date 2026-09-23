using UMS.Api.Models;

namespace UMS.Api.Repositories.Questionnaires;

public interface IQuestionnaireRepository
{
    Task<List<Questionnaire>> GetByCourseIdAsync(int courseId);
    Task<Questionnaire?> GetByIdAsync(int id);
    Task<Questionnaire?> GetByIdWithDetailsAsync(int id);
    Task AddAsync(Questionnaire questionnaire);
    void Remove(Questionnaire questionnaire);
}
