using UMS.Api.Models;

namespace UMS.Api.Repositories.Users;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailWithRolesAsync(string email);
    Task<bool> ExistsByEmailAsync(string email);
    Task AddAsync(User user);
}
