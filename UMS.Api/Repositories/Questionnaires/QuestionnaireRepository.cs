using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.Questionnaires;

public class QuestionnaireRepository(ApplicationDbContext db) : IQuestionnaireRepository
{
    public Task<List<Questionnaire>> GetByCourseIdAsync(int courseId)
    {
        return QueryWithDetails()
            .Where(questionnaire => questionnaire.CourseOfferingId == courseId)
            .OrderByDescending(questionnaire => questionnaire.CreatedAt)
            .ToListAsync();
    }

    public Task<Questionnaire?> GetByIdAsync(int id)
    {
        return db.Questionnaires.SingleOrDefaultAsync(questionnaire => questionnaire.Id == id);
    }

    public Task<Questionnaire?> GetByIdWithDetailsAsync(int id)
    {
        return QueryWithDetails().SingleOrDefaultAsync(questionnaire => questionnaire.Id == id);
    }

    public async Task AddAsync(Questionnaire questionnaire)
    {
        await db.Questionnaires.AddAsync(questionnaire);
    }

    public void Remove(Questionnaire questionnaire)
    {
        db.Questionnaires.Remove(questionnaire);
    }

    private IQueryable<Questionnaire> QueryWithDetails()
    {
        return db.Questionnaires
            .Include(questionnaire => questionnaire.CourseOffering).ThenInclude(offering => offering.Course)
            .Include(questionnaire => questionnaire.Questions);
    }
}
