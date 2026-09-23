using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UMS.Api.Models;

namespace UMS.Api.Services.Tokens;

public class TokenService(IConfiguration configuration) : ITokenService
{
    public string CreateAccessToken(User user, IReadOnlyCollection<string> roles)
    {
        var secret = configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT secret is missing.");

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var primaryRole = roles.FirstOrDefault() ?? AppRoles.Student;
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("userId", user.Id.ToString()),
            new("username", user.FullName),
            new("email", user.Email),
            new("role", ToLegacyRole(primaryRole))
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(6),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string ToLegacyRole(string role)
    {
        return role switch
        {
            AppRoles.Student => "student",
            AppRoles.Admin => "admin",
            AppRoles.SuperAdmin => "super_admin",
            _ => role
        };
    }
}
