using UMS.Api.Models;

namespace UMS.Api.Repositories.Roles;

public interface IRoleRepository
{
    Task<Role?> GetByNameAsync(string name);
}
