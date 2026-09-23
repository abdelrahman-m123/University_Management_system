using UMS.Api.DTOs.Staff;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Staff;

public interface IStaffService
{
    Task<List<StaffResponse>> GetAllAsync();
    Task<ServiceResult<StaffResponse>> GetByUserIdAsync(int userId);
    Task<ServiceResult<StaffResponse>> UpdateAsync(int userId, UpdateStaffProfileRequest request);
}
