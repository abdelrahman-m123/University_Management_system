using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.QuestionnaireQuestions;

public class QuestionnaireQuestionRepository(ApplicationDbContext db) : IQuestionnaireQuestionRepository
{
    public Task<QuestionnaireQuestion?> GetByIdAsync(int id)
    {
        return db.QuestionnaireQuestions.SingleOrDefaultAsync(question => question.Id == id);
    }

    public async Task AddAsync(QuestionnaireQuestion question)
    {
        await db.QuestionnaireQuestions.AddAsync(question);
    }

    public void Remove(QuestionnaireQuestion question)
    {
        db.QuestionnaireQuestions.Remove(question);
    }
}
