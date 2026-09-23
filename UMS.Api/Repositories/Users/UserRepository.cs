using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.Users;

public class UserRepository(ApplicationDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(int id)
    {
        return db.Users.SingleOrDefaultAsync(user => user.Id == id);
    }

    public Task<User?> GetByEmailWithRolesAsync(string email)
    {
        return db.Users
            .Include(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(user => user.Email == email);
    }

    public Task<bool> ExistsByEmailAsync(string email)
    {
        return db.Users.AnyAsync(user => user.Email == email);
    }

    public async Task AddAsync(User user)
    {
        await db.Users.AddAsync(user);
    }
}
