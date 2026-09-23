using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.Quizzes;

public class QuizRepository(ApplicationDbContext db) : IQuizRepository
{
    public Task<List<Quiz>> GetByCourseIdAsync(int courseId)
    {
        return db.Quizzes
            .Include(quiz => quiz.CourseOffering).ThenInclude(offering => offering.Course)
            .Where(quiz => quiz.CourseOfferingId == courseId)
            .OrderByDescending(quiz => quiz.CreatedAt)
            .ToListAsync();
    }

    public Task<Quiz?> GetByIdAsync(int id)
    {
        return db.Quizzes.SingleOrDefaultAsync(quiz => quiz.Id == id);
    }

    public Task<Quiz?> GetByIdWithCourseAsync(int id)
    {
        return db.Quizzes
            .Include(quiz => quiz.CourseOffering).ThenInclude(offering => offering.Course)
            .SingleOrDefaultAsync(quiz => quiz.Id == id);
    }

    public async Task AddAsync(Quiz quiz)
    {
        await db.Quizzes.AddAsync(quiz);
    }

    public void Remove(Quiz quiz)
    {
        db.Quizzes.Remove(quiz);
    }
}
