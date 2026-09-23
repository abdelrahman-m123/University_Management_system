using UMS.Api.DTOs.Auth;
using UMS.Api.Models;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.Roles;
using UMS.Api.Repositories.Users;
using UMS.Api.Services.Common;
using UMS.Api.Services.Tokens;

namespace UMS.Api.Services.Auth;

public class AuthService(
    IUserRepository users,
    IRoleRepository roles,
    IUnitOfWork unitOfWork,
    ITokenService tokenService) : IAuthService
{
    public async Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var user = await users.GetByEmailWithRolesAsync(normalizedEmail);

        if (user is null)
        {
            return ServiceResult<AuthResponse>.Failure(ResultStatus.NotFound, "User not found");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return ServiceResult<AuthResponse>.Failure(ResultStatus.InvalidCredentials, "Invalid password");
        }

        var userRoles = user.UserRoles.Select(userRole => userRole.Role.Name).ToList();
        var accessToken = tokenService.CreateAccessToken(user, userRoles);

        return ServiceResult<AuthResponse>.Success(new AuthResponse
        {
            Success = true,
            Message = "Logged in successfully",
            AccessToken = accessToken
        }, "Logged in successfully");
    }

    public async Task<AddUsersResponse> AddUsersAsync(AddUsersRequest request)
    {
        var response = new AddUsersResponse();

        for (var i = 0; i < request.Users.Count; i++)
        {
            var requestedUser = request.Users[i];
            var normalizedEmail = NormalizeEmail(requestedUser.Email);
            var roleName = NormalizeRole(requestedUser.Role);

            if (roleName is null)
            {
                response.Failed.Add(new FailedUserResult
                {
                    Index = i,
                    Email = requestedUser.Email,
                    Message = "Invalid role"
                });
                continue;
            }

            if (await users.ExistsByEmailAsync(normalizedEmail))
            {
                response.Failed.Add(new FailedUserResult
                {
                    Index = i,
                    Email = requestedUser.Email,
                    Message = "User already exists"
                });
                continue;
            }

            var role = await roles.GetByNameAsync(roleName);
            if (role is null)
            {
                response.Failed.Add(new FailedUserResult
                {
                    Index = i,
                    Email = requestedUser.Email,
                    Message = "Role does not exist"
                });
                continue;
            }

            var user = CreateUser(requestedUser, normalizedEmail, role);
            await users.AddAsync(user);

            response.Added.Add(new AddedUserResult
            {
                Index = i,
                Email = requestedUser.Email,
                Username = requestedUser.Username,
                Message = "Added successfully"
            });
        }

        await unitOfWork.SaveChangesAsync();

        response.Success = response.Failed.Count == 0;
        response.Message = $"Processed {request.Users.Count} users. Added: {response.Added.Count}, Failed: {response.Failed.Count}";

        return response;
    }

    private static User CreateUser(CreateUserRequest request, string normalizedEmail, Role role)
    {
        var user = new User
        {
            FullName = request.Username.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsVerified = true
        };

        user.UserRoles.Add(new UserRole
        {
            User = user,
            Role = role
        });

        if (role.Name == AppRoles.Student)
        {
            user.StudentProfile = new StudentProfile();
        }
        else
        {
            user.StaffProfile = new StaffProfile();
        }

        return user;
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    private static string? NormalizeRole(string role)
    {
        return role.Trim() switch
        {
            "student" => AppRoles.Student,
            "Student" => AppRoles.Student,
            "TA" => AppRoles.TeachingAssistant,
            "Doctor" => AppRoles.Doctor,
            "admin" => AppRoles.Admin,
            "Admin" => AppRoles.Admin,
            "super_admin" => AppRoles.SuperAdmin,
            "SuperAdmin" => AppRoles.SuperAdmin,
            _ => null
        };
    }
}
