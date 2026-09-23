using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.StaffCourses;

public class StaffCourseRepository(ApplicationDbContext db) : IStaffCourseRepository
{
    public Task<List<StaffCourse>> GetByStaffIdAsync(int staffId)
    {
        return QueryWithDetails()
            .Where(staffCourse => staffCourse.StaffId == staffId)
            .OrderBy(staffCourse => staffCourse.CourseOffering.Course.Code)
            .ToListAsync();
    }

    public Task<List<StaffCourse>> GetByCourseIdAsync(int courseId)
    {
        return QueryWithDetails()
            .Where(staffCourse => staffCourse.CourseOfferingId == courseId)
            .OrderBy(staffCourse => staffCourse.Staff.User.FullName)
            .ToListAsync();
    }

    public Task<StaffCourse?> GetByIdsAsync(int staffId, int courseId)
    {
        return db.StaffCourses.SingleOrDefaultAsync(staffCourse => staffCourse.StaffId == staffId && staffCourse.CourseOfferingId == courseId);
    }

    public Task<StaffCourse?> GetByIdsWithDetailsAsync(int staffId, int courseId)
    {
        return QueryWithDetails().SingleOrDefaultAsync(staffCourse => staffCourse.StaffId == staffId && staffCourse.CourseOfferingId == courseId);
    }

    public Task<bool> ExistsAsync(int staffId, int courseId)
    {
        return db.StaffCourses.AnyAsync(staffCourse => staffCourse.StaffId == staffId && staffCourse.CourseOfferingId == courseId);
    }

    public async Task AddAsync(StaffCourse staffCourse)
    {
        await db.StaffCourses.AddAsync(staffCourse);
    }

    public void Remove(StaffCourse staffCourse)
    {
        db.StaffCourses.Remove(staffCourse);
    }

    private IQueryable<StaffCourse> QueryWithDetails()
    {
        return db.StaffCourses
            .Include(staffCourse => staffCourse.Staff)
            .ThenInclude(staff => staff.User)
            .Include(staffCourse => staffCourse.CourseOffering).ThenInclude(offering => offering.Course)
            .Include(staffCourse => staffCourse.CourseOffering).ThenInclude(offering => offering.Semester);
    }
}
