using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.DTOs.Questionnaires;
using UMS.Api.Models;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.Questionnaires;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Questionnaires;

public class QuestionnaireService(
    IQuestionnaireRepository questionnaires,
    ApplicationDbContext db,
    IUnitOfWork unitOfWork) : IQuestionnaireService
{
    public async Task<List<QuestionnaireResponse>> GetByCourseIdAsync(int courseId)
    {
        var questionnaireList = await questionnaires.GetByCourseIdAsync(courseId);
        return questionnaireList.Select(ToResponse).ToList();
    }

    public async Task<ServiceResult<QuestionnaireResponse>> CreateAsync(CreateQuestionnaireRequest request)
    {
        if (!await db.CourseOfferings.AnyAsync(item => item.Id == request.CourseOfferingId))
        {
            return ServiceResult<QuestionnaireResponse>.Failure(ResultStatus.NotFound, "Course not found");
        }

        var questionnaire = new Questionnaire
        {
            CourseOfferingId = request.CourseOfferingId,
            Questions = request.Questions.Select(question => new QuestionnaireQuestion
            {
                Text = question.Text.Trim(),
                IsRequired = question.IsRequired
            }).ToList()
        };

        await questionnaires.AddAsync(questionnaire);
        await unitOfWork.SaveChangesAsync();

        var savedQuestionnaire = await questionnaires.GetByIdWithDetailsAsync(questionnaire.Id);
        return ServiceResult<QuestionnaireResponse>.Success(ToResponse(savedQuestionnaire!), "Questionnaire created successfully");
    }

    public async Task<ServiceResult<object>> DeleteAsync(int id)
    {
        var questionnaire = await questionnaires.GetByIdAsync(id);
        if (questionnaire is null)
        {
            return ServiceResult<object>.Failure(ResultStatus.NotFound, "Questionnaire not found");
        }

        questionnaires.Remove(questionnaire);
        await unitOfWork.SaveChangesAsync();
        return ServiceResult<object>.Success(new object(), "Questionnaire deleted successfully");
    }

    private static QuestionnaireResponse ToResponse(Questionnaire questionnaire)
    {
        return new QuestionnaireResponse
        {
            Id = questionnaire.Id,
            CourseId = questionnaire.CourseOffering.CourseId,
            CourseOfferingId = questionnaire.CourseOfferingId,
            CourseCode = questionnaire.CourseOffering.Course.Code,
            CreatedAt = questionnaire.CreatedAt,
            Questions = questionnaire.Questions.Select(question => new QuestionnaireQuestionResponse
            {
                Id = question.Id,
                Text = question.Text,
                IsRequired = question.IsRequired
            }).ToList()
        };
    }
}
