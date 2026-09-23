using UMS.Api.Models;

namespace UMS.Api.Repositories.Comments;

public interface ICommentRepository
{
    Task<Comment?> GetByIdAsync(int id);
    Task AddAsync(Comment comment);
    void Remove(Comment comment);
}
