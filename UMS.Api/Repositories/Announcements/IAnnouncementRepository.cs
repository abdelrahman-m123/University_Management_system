using UMS.Api.Models;

namespace UMS.Api.Repositories.Announcements;

public interface IAnnouncementRepository
{
    Task<List<Announcement>> GetByCourseIdAsync(int courseId);
    Task<Announcement?> GetByIdWithDetailsAsync(int id);
    Task<Announcement?> GetByIdAsync(int id);
    Task AddAsync(Announcement announcement);
    void Remove(Announcement announcement);
}
