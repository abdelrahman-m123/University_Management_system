using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.StaffProfiles;

public class StaffProfileRepository(ApplicationDbContext db) : IStaffProfileRepository
{
    public Task<List<StaffProfile>> GetAllWithUsersAsync()
    {
        return db.StaffProfiles
            .Include(profile => profile.User)
            .ThenInclude(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .OrderBy(profile => profile.User.FullName)
            .ToListAsync();
    }

    public Task<StaffProfile?> GetByUserIdWithUserAsync(int userId)
    {
        return db.StaffProfiles
            .Include(profile => profile.User)
            .ThenInclude(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(profile => profile.UserId == userId);
    }

}
