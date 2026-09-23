using UMS.Api.Models;

namespace UMS.Api.Repositories.StaffProfiles;

public interface IStaffProfileRepository
{
    Task<List<StaffProfile>> GetAllWithUsersAsync();
    Task<StaffProfile?> GetByUserIdWithUserAsync(int userId);
}
