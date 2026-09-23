using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.StudentProfiles;

public class StudentProfileRepository(ApplicationDbContext db) : IStudentProfileRepository
{
    public Task<List<StudentProfile>> GetAllWithUsersAsync()
    {
        return db.StudentProfiles
            .Include(profile => profile.User)
            .OrderBy(profile => profile.User.FullName)
            .ToListAsync();
    }

    public Task<StudentProfile?> GetByUserIdWithUserAsync(int userId)
    {
        return db.StudentProfiles
            .Include(profile => profile.User)
            .SingleOrDefaultAsync(profile => profile.UserId == userId);
    }

}
