using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.Announcements;

public class AnnouncementRepository(ApplicationDbContext db) : IAnnouncementRepository
{
    public Task<List<Announcement>> GetByCourseIdAsync(int courseId)
    {
        return QueryWithDetails()
            .Where(announcement => announcement.CourseOfferingId == courseId)
            .OrderByDescending(announcement => announcement.CreatedAt)
            .ToListAsync();
    }

    public Task<Announcement?> GetByIdWithDetailsAsync(int id)
    {
        return QueryWithDetails().SingleOrDefaultAsync(announcement => announcement.Id == id);
    }

    public Task<Announcement?> GetByIdAsync(int id)
    {
        return db.Announcements.SingleOrDefaultAsync(announcement => announcement.Id == id);
    }

    public async Task AddAsync(Announcement announcement)
    {
        await db.Announcements.AddAsync(announcement);
    }

    public void Remove(Announcement announcement)
    {
        db.Announcements.Remove(announcement);
    }

    private IQueryable<Announcement> QueryWithDetails()
    {
        return db.Announcements
            .Include(announcement => announcement.CourseOffering).ThenInclude(offering => offering.Course)
            .Include(announcement => announcement.Author)
            .Include(announcement => announcement.Comments)
            .ThenInclude(comment => comment.Author);
    }
}
