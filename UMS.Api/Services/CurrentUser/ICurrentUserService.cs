namespace UMS.Api.Services.CurrentUser;

public interface ICurrentUserService
{
    int? UserId { get; }
    string? Email { get; }
    bool IsInRole(string role);
}
