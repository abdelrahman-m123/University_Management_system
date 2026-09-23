using UMS.Api.Models;

namespace UMS.Api.Repositories.StaffCourses;

public interface IStaffCourseRepository
{
    Task<List<StaffCourse>> GetByStaffIdAsync(int staffId);
    Task<List<StaffCourse>> GetByCourseIdAsync(int courseId);
    Task<StaffCourse?> GetByIdsAsync(int staffId, int courseId);
    Task<StaffCourse?> GetByIdsWithDetailsAsync(int staffId, int courseId);
    Task<bool> ExistsAsync(int staffId, int courseId);
    Task AddAsync(StaffCourse staffCourse);
    void Remove(StaffCourse staffCourse);
}
