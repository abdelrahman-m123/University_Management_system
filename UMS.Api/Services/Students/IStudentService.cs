using UMS.Api.DTOs.Students;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Students;

public interface IStudentService
{
    Task<List<StudentResponse>> GetAllAsync();
    Task<ServiceResult<StudentResponse>> GetByUserIdAsync(int userId);
    Task<ServiceResult<StudentResponse>> UpdateAsync(int userId, UpdateStudentProfileRequest request);
}
