using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.CourseContents;

public class CourseContentRepository(ApplicationDbContext db) : ICourseContentRepository
{
    public Task<List<CourseContent>> GetByCourseIdAsync(int courseId)
    {
        return db.CourseContents
            .Where(content => content.CourseOfferingId == courseId)
            .OrderByDescending(content => content.UploadedAt)
            .ToListAsync();
    }

    public Task<CourseContent?> GetByIdAsync(int id)
    {
        return db.CourseContents.SingleOrDefaultAsync(content => content.Id == id);
    }

    public async Task AddAsync(CourseContent content)
    {
        await db.CourseContents.AddAsync(content);
    }

    public void Remove(CourseContent content)
    {
        db.CourseContents.Remove(content);
    }
}
