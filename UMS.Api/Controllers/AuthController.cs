using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.Auth;
using UMS.Api.Models;
using UMS.Api.Services.Auth;
using UMS.Api.Services.Common;

namespace UMS.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        if (result.IsSuccess)
        {
            return Created(string.Empty, result.Data);
        }

        var response = new AuthResponse
        {
            Success = false,
            Message = result.Message
        };

        return result.Status switch
        {
            ResultStatus.NotFound => NotFound(response),
            ResultStatus.InvalidCredentials => Unauthorized(response),
            _ => BadRequest(response)
        };
    }

    [HttpPost("addUser")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<AddUsersResponse>> AddUsers(AddUsersRequest request)
    {
        var response = await authService.AddUsersAsync(request);
        return Ok(response);
    }
}
