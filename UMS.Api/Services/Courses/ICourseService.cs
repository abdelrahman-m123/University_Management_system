using UMS.Api.DTOs.Courses;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Courses;

public interface ICourseService
{
    Task<List<CourseResponse>> GetAllAsync();
    Task<ServiceResult<CourseResponse>> GetByIdAsync(int id);
    Task<ServiceResult<CourseResponse>> CreateAsync(CreateCourseRequest request);
    Task<ServiceResult<CourseResponse>> UpdateAsync(int id, UpdateCourseRequest request);
    Task<ServiceResult<object>> DeleteAsync(int id);
}
