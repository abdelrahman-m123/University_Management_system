using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.CourseEnrollments;

public class CourseEnrollmentRepository(ApplicationDbContext db) : ICourseEnrollmentRepository
{
    public Task<List<CourseEnrollment>> GetAllWithDetailsAsync()
    {
        return QueryWithDetails()
            .OrderBy(enrollment => enrollment.CourseOffering.Course.Code)
            .ThenBy(enrollment => enrollment.Student.User.FullName)
            .ToListAsync();
    }

    public Task<List<CourseEnrollment>> GetByStudentIdWithCourseAsync(int studentId)
    {
        return QueryWithDetails()
            .Where(enrollment => enrollment.StudentId == studentId)
            .OrderBy(enrollment => enrollment.CourseOffering.Course.Code)
            .ToListAsync();
    }

    public Task<CourseEnrollment?> GetByIdsWithDetailsAsync(int courseId, int studentId)
    {
        return QueryWithDetails()
            .SingleOrDefaultAsync(enrollment => enrollment.CourseOfferingId == courseId && enrollment.StudentId == studentId);
    }

    public Task<bool> ExistsAsync(int courseId, int studentId)
    {
        return db.CourseEnrollments.AnyAsync(enrollment => enrollment.CourseOfferingId == courseId && enrollment.StudentId == studentId);
    }

    public Task<bool> HasEnrollmentsForCourseAsync(int courseId)
    {
        return db.CourseEnrollments.AnyAsync(enrollment => enrollment.CourseOffering.CourseId == courseId);
    }

    public async Task AddAsync(CourseEnrollment enrollment)
    {
        await db.CourseEnrollments.AddAsync(enrollment);
    }

    public void Remove(CourseEnrollment enrollment)
    {
        db.CourseEnrollments.Remove(enrollment);
    }

    private IQueryable<CourseEnrollment> QueryWithDetails()
    {
        return db.CourseEnrollments
            .Include(enrollment => enrollment.CourseOffering).ThenInclude(offering => offering.Course)
            .Include(enrollment => enrollment.CourseOffering).ThenInclude(offering => offering.Semester)
            .Include(enrollment => enrollment.Student)
            .ThenInclude(student => student.User);
    }
}
