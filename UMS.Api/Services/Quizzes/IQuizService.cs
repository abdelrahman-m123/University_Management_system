using UMS.Api.DTOs.Quizzes;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Quizzes;

public interface IQuizService
{
    Task<List<QuizResponse>> GetByCourseIdAsync(int courseId);
    Task<List<QuizGradeResponse>> GetGradesAsync(int quizId);
    Task<ServiceResult<QuizResponse>> CreateAsync(CreateQuizRequest request);
    Task<ServiceResult<QuizResponse>> UpdateAsync(int id, UpdateQuizRequest request);
    Task<ServiceResult<QuizGradeResponse>> GradeAsync(int quizId, GradeQuizRequest request);
    Task<ServiceResult<object>> DeleteAsync(int id);
}
