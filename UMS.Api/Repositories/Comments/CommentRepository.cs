using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.Comments;

public class CommentRepository(ApplicationDbContext db) : ICommentRepository
{
    public Task<Comment?> GetByIdAsync(int id)
    {
        return db.Comments
            .Include(comment => comment.Author)
            .SingleOrDefaultAsync(comment => comment.Id == id);
    }

    public async Task AddAsync(Comment comment)
    {
        await db.Comments.AddAsync(comment);
    }

    public void Remove(Comment comment)
    {
        db.Comments.Remove(comment);
    }
}
