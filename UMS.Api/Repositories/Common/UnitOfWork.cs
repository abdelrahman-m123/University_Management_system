using UMS.Api.Data;

namespace UMS.Api.Repositories.Common;

public class UnitOfWork(ApplicationDbContext db) : IUnitOfWork
{
    public Task SaveChangesAsync()
    {
        return db.SaveChangesAsync();
    }
}
