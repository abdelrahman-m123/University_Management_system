using UMS.Api.Models;

namespace UMS.Api.Repositories.Quizzes;

public interface IQuizRepository
{
    Task<List<Quiz>> GetByCourseIdAsync(int courseId);
    Task<Quiz?> GetByIdAsync(int id);
    Task<Quiz?> GetByIdWithCourseAsync(int id);
    Task AddAsync(Quiz quiz);
    void Remove(Quiz quiz);
}
