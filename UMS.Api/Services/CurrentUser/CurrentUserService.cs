using System.Security.Claims;

namespace UMS.Api.Services.CurrentUser;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public int? UserId
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User.FindFirstValue("userId");
            return int.TryParse(value, out var userId) ? userId : null;
        }
    }

    public string? Email => httpContextAccessor.HttpContext?.User.FindFirstValue("email");

    public bool IsInRole(string role)
    {
        return httpContextAccessor.HttpContext?.User.IsInRole(role) == true;
    }
}
