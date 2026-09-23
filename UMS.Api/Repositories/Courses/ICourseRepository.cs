using UMS.Api.Models;

namespace UMS.Api.Repositories.Courses;

public interface ICourseRepository
{
    Task<List<Course>> GetAllAsync();
    Task<Course?> GetByIdAsync(int id);
    Task<bool> ExistsByCodeAsync(string code);
    Task<bool> ExistsByNameAsync(string name);
    Task<bool> ExistsByCodeForAnotherCourseAsync(string code, int courseId);
    Task<bool> ExistsByNameForAnotherCourseAsync(string name, int courseId);
    Task AddAsync(Course course);
    void Remove(Course course);
}
