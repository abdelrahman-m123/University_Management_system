using UMS.Api.DTOs.StaffCourses;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.StaffCourses;

public interface IStaffCourseService
{
    Task<List<StaffCourseResponse>> GetByStaffIdAsync(int staffId);
    Task<List<StaffCourseResponse>> GetByCourseIdAsync(int courseId);
    Task<ServiceResult<StaffCourseResponse>> AssignAsync(AssignStaffCourseRequest request);
    Task<ServiceResult<object>> UnassignAsync(int staffId, int courseId);
}
