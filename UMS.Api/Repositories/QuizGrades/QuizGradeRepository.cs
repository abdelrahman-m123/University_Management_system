using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.QuizGrades;

public class QuizGradeRepository(ApplicationDbContext db) : IQuizGradeRepository
{
    public Task<List<QuizGrade>> GetByQuizIdAsync(int quizId)
    {
        return db.QuizGrades
            .Include(grade => grade.Student)
            .ThenInclude(student => student.User)
            .Where(grade => grade.QuizId == quizId)
            .OrderBy(grade => grade.Student.User.FullName)
            .ToListAsync();
    }

    public Task<QuizGrade?> GetByIdsAsync(int quizId, int studentId)
    {
        return db.QuizGrades.SingleOrDefaultAsync(grade => grade.QuizId == quizId && grade.StudentId == studentId);
    }

    public async Task AddAsync(QuizGrade grade)
    {
        await db.QuizGrades.AddAsync(grade);
    }
}
