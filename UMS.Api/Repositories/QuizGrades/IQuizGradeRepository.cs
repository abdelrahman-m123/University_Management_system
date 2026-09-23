using UMS.Api.Models;

namespace UMS.Api.Repositories.QuizGrades;

public interface IQuizGradeRepository
{
    Task<List<QuizGrade>> GetByQuizIdAsync(int quizId);
    Task<QuizGrade?> GetByIdsAsync(int quizId, int studentId);
    Task AddAsync(QuizGrade grade);
}
