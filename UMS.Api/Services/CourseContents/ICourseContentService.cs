using UMS.Api.DTOs.CourseContents;
using UMS.Api.Models;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.CourseContents;

public interface ICourseContentService
{
    Task<List<CourseContentResponse>> GetByCourseIdAsync(int courseId);
    Task<ServiceResult<CourseContentResponse>> UploadAsync(int courseId, IFormFile file);
    Task<ServiceResult<CourseContent>> GetFileAsync(int id);
    Task<ServiceResult<object>> DeleteAsync(int id);
}
