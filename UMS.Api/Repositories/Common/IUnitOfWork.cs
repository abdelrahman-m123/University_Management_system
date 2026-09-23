namespace UMS.Api.Repositories.Common;

public interface IUnitOfWork
{
    Task SaveChangesAsync();
}
