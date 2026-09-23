using UMS.Api.DTOs.Auth;
using UMS.Api.DTOs.Setup;
using UMS.Api.Models;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.Roles;
using UMS.Api.Repositories.Users;
using UMS.Api.Services.Common;
using UMS.Api.Services.Tokens;

namespace UMS.Api.Services.Setup;

public class SetupService(
    IUserRepository users,
    IRoleRepository roles,
    IUnitOfWork unitOfWork,
    ITokenService tokenService) : ISetupService
{
    public async Task<ServiceResult<AuthResponse>> CreateAdminAsync(CreateAdminRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await users.ExistsByEmailAsync(email))
        {
            return ServiceResult<AuthResponse>.Failure(ResultStatus.Conflict, "A user with this email already exists");
        }

        var adminRole = await roles.GetByNameAsync(AppRoles.Admin);
        if (adminRole is null)
        {
            return ServiceResult<AuthResponse>.Failure(ResultStatus.NotFound, "Admin role has not been seeded");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsVerified = true,
            StaffProfile = new StaffProfile()
        };

        user.UserRoles.Add(new UserRole
        {
            User = user,
            Role = adminRole
        });

        await users.AddAsync(user);
        await unitOfWork.SaveChangesAsync();

        var accessToken = tokenService.CreateAccessToken(user, [AppRoles.Admin]);

        return ServiceResult<AuthResponse>.Success(new AuthResponse
        {
            Success = true,
            Message = "Admin user created successfully",
            AccessToken = accessToken
        }, "Admin user created successfully");
    }
}
