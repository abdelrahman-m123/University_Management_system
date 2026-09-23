using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Models;

namespace UMS.Api.Repositories.Roles;

public class RoleRepository(ApplicationDbContext db) : IRoleRepository
{
    public Task<Role?> GetByNameAsync(string name)
    {
        return db.Roles.SingleOrDefaultAsync(role => role.Name == name);
    }
}
