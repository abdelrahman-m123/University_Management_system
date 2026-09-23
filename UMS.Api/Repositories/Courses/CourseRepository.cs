using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.Courses;

public class CourseRepository(ApplicationDbContext db) : ICourseRepository
{
    public Task<List<Course>> GetAllAsync()
    {
        return db.Courses
            .OrderBy(course => course.Code)
            .ToListAsync();
    }

    public Task<Course?> GetByIdAsync(int id)
    {
        return db.Courses.SingleOrDefaultAsync(course => course.Id == id);
    }

    public Task<bool> ExistsByCodeAsync(string code)
    {
        return db.Courses.AnyAsync(course => course.Code == code);
    }

    public Task<bool> ExistsByNameAsync(string name)
    {
        return db.Courses.AnyAsync(course => course.Name == name);
    }

    public Task<bool> ExistsByCodeForAnotherCourseAsync(string code, int courseId)
    {
        return db.Courses.AnyAsync(course => course.Code == code && course.Id != courseId);
    }

    public Task<bool> ExistsByNameForAnotherCourseAsync(string name, int courseId)
    {
        return db.Courses.AnyAsync(course => course.Name == name && course.Id != courseId);
    }

    public async Task AddAsync(Course course)
    {
        await db.Courses.AddAsync(course);
    }

    public void Remove(Course course)
    {
        db.Courses.Remove(course);
    }
}
