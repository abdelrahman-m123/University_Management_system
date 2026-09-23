using UMS.Api.DTOs.Auth;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Auth;

public interface IAuthService
{
    Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request);
    Task<AddUsersResponse> AddUsersAsync(AddUsersRequest request);
}
