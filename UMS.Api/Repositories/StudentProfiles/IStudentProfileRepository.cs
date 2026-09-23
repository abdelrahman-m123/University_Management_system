using UMS.Api.Models;

namespace UMS.Api.Repositories.StudentProfiles;

public interface IStudentProfileRepository
{
    Task<List<StudentProfile>> GetAllWithUsersAsync();
    Task<StudentProfile?> GetByUserIdWithUserAsync(int userId);
}
