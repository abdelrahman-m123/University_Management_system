using UMS.Api.DTOs.Auth;
using UMS.Api.DTOs.Setup;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Setup;

public interface ISetupService
{
    Task<ServiceResult<AuthResponse>> CreateAdminAsync(CreateAdminRequest request);
}
