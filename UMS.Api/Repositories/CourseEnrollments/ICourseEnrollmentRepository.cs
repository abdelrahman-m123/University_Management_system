using UMS.Api.Models;

namespace UMS.Api.Repositories.CourseEnrollments;

public interface ICourseEnrollmentRepository
{
    Task<List<CourseEnrollment>> GetAllWithDetailsAsync();
    Task<List<CourseEnrollment>> GetByStudentIdWithCourseAsync(int studentId);
    Task<CourseEnrollment?> GetByIdsWithDetailsAsync(int courseId, int studentId);
    Task<bool> ExistsAsync(int courseId, int studentId);
    Task<bool> HasEnrollmentsForCourseAsync(int courseId);
    Task AddAsync(CourseEnrollment enrollment);
    void Remove(CourseEnrollment enrollment);
}
