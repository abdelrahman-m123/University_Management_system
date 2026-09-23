using UMS.Api.Models;

namespace UMS.Api.Repositories.CourseContents;

public interface ICourseContentRepository
{
    Task<List<CourseContent>> GetByCourseIdAsync(int courseId);
    Task<CourseContent?> GetByIdAsync(int id);
    Task AddAsync(CourseContent content);
    void Remove(CourseContent content);
}
