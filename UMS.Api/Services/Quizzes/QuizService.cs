using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.DTOs.Quizzes;
using UMS.Api.Models;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.QuizGrades;
using UMS.Api.Repositories.Quizzes;
using UMS.Api.Repositories.StudentProfiles;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Quizzes;

public class QuizService(
    IQuizRepository quizzes,
    IQuizGradeRepository quizGrades,
    ApplicationDbContext db,
    IStudentProfileRepository students,
    IUnitOfWork unitOfWork) : IQuizService
{
    public async Task<List<QuizResponse>> GetByCourseIdAsync(int courseId)
    {
        var quizList = await quizzes.GetByCourseIdAsync(courseId);
        return quizList.Select(ToResponse).ToList();
    }

    public async Task<List<QuizGradeResponse>> GetGradesAsync(int quizId)
    {
        var grades = await quizGrades.GetByQuizIdAsync(quizId);
        return grades.Select(ToGradeResponse).ToList();
    }

    public async Task<ServiceResult<QuizResponse>> CreateAsync(CreateQuizRequest request)
    {
        if (!await db.CourseOfferings.AnyAsync(item => item.Id == request.CourseOfferingId))
        {
            return ServiceResult<QuizResponse>.Failure(ResultStatus.NotFound, "Course not found");
        }

        if (request.OpensAt is not null && request.ClosesAt is not null && request.ClosesAt <= request.OpensAt)
        {
            return ServiceResult<QuizResponse>.Failure(ResultStatus.ValidationError, "Quiz close date must be after open date");
        }

        var quiz = new Quiz
        {
            CourseOfferingId = request.CourseOfferingId,
            Title = request.Title.Trim(),
            GoogleFormUrl = request.GoogleFormUrl?.Trim(),
            MaxGrade = request.MaxGrade,
            OpensAt = request.OpensAt,
            ClosesAt = request.ClosesAt,
            IsVisible = request.IsVisible
        };

        await quizzes.AddAsync(quiz);
        await unitOfWork.SaveChangesAsync();

        var savedQuiz = await quizzes.GetByIdWithCourseAsync(quiz.Id);
        return ServiceResult<QuizResponse>.Success(ToResponse(savedQuiz!), "Quiz created successfully");
    }

    public async Task<ServiceResult<QuizResponse>> UpdateAsync(int id, UpdateQuizRequest request)
    {
        var quiz = await quizzes.GetByIdWithCourseAsync(id);
        if (quiz is null)
        {
            return ServiceResult<QuizResponse>.Failure(ResultStatus.NotFound, "Quiz not found");
        }

        if (request.OpensAt is not null && request.ClosesAt is not null && request.ClosesAt <= request.OpensAt)
        {
            return ServiceResult<QuizResponse>.Failure(ResultStatus.ValidationError, "Quiz close date must be after open date");
        }

        quiz.Title = request.Title.Trim();
        quiz.GoogleFormUrl = request.GoogleFormUrl?.Trim();
        quiz.MaxGrade = request.MaxGrade;
        quiz.OpensAt = request.OpensAt;
        quiz.ClosesAt = request.ClosesAt;
        quiz.IsVisible = request.IsVisible;

        await unitOfWork.SaveChangesAsync();
        return ServiceResult<QuizResponse>.Success(ToResponse(quiz), "Quiz updated successfully");
    }

    public async Task<ServiceResult<QuizGradeResponse>> GradeAsync(int quizId, GradeQuizRequest request)
    {
        var quiz = await quizzes.GetByIdAsync(quizId);
        if (quiz is null)
        {
            return ServiceResult<QuizGradeResponse>.Failure(ResultStatus.NotFound, "Quiz not found");
        }

        var student = await students.GetByUserIdWithUserAsync(request.StudentId);
        if (student is null)
        {
            return ServiceResult<QuizGradeResponse>.Failure(ResultStatus.NotFound, "Student not found");
        }

        if (request.Grade > quiz.MaxGrade)
        {
            return ServiceResult<QuizGradeResponse>.Failure(ResultStatus.ValidationError, "Grade cannot exceed quiz max grade");
        }

        var grade = await quizGrades.GetByIdsAsync(quizId, request.StudentId);
        if (grade is null)
        {
            grade = new QuizGrade { QuizId = quizId, StudentId = request.StudentId };
            await quizGrades.AddAsync(grade);
        }

        grade.Grade = request.Grade;
        grade.GradedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync();

        grade.Student = student;
        return ServiceResult<QuizGradeResponse>.Success(ToGradeResponse(grade), "Quiz graded successfully");
    }

    public async Task<ServiceResult<object>> DeleteAsync(int id)
    {
        var quiz = await quizzes.GetByIdAsync(id);
        if (quiz is null)
        {
            return ServiceResult<object>.Failure(ResultStatus.NotFound, "Quiz not found");
        }

        quizzes.Remove(quiz);
        await unitOfWork.SaveChangesAsync();
        return ServiceResult<object>.Success(new object(), "Quiz deleted successfully");
    }

    private static QuizResponse ToResponse(Quiz quiz)
    {
        return new QuizResponse
        {
            Id = quiz.Id,
            CourseId = quiz.CourseOffering.CourseId,
            CourseOfferingId = quiz.CourseOfferingId,
            CourseCode = quiz.CourseOffering.Course.Code,
            Title = quiz.Title,
            GoogleFormUrl = quiz.GoogleFormUrl,
            MaxGrade = quiz.MaxGrade,
            OpensAt = quiz.OpensAt,
            ClosesAt = quiz.ClosesAt,
            IsVisible = quiz.IsVisible,
            CreatedAt = quiz.CreatedAt
        };
    }

    private static QuizGradeResponse ToGradeResponse(QuizGrade grade)
    {
        return new QuizGradeResponse
        {
            QuizId = grade.QuizId,
            StudentId = grade.StudentId,
            StudentName = grade.Student.User.FullName,
            Grade = grade.Grade,
            GradedAt = grade.GradedAt
        };
    }
}
