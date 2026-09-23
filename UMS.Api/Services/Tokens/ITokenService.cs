using UMS.Api.Models;

namespace UMS.Api.Services.Tokens;

public interface ITokenService
{
    string CreateAccessToken(User user, IReadOnlyCollection<string> roles);
}
