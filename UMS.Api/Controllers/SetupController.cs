using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.Auth;
using UMS.Api.DTOs.Setup;
using UMS.Api.Services.Common;
using UMS.Api.Services.Setup;

namespace UMS.Api.Controllers;

[ApiController]
[Route("api/setup")]
public class SetupController(ISetupService setupService, IWebHostEnvironment environment) : ControllerBase
{
    [HttpPost("admin")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> CreateAdmin(CreateAdminRequest request)
    {
        if (!environment.IsDevelopment())
        {
            return NotFound();
        }

        var result = await setupService.CreateAdminAsync(request);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        var response = new { success = false, message = result.Message };
        return result.Status == ResultStatus.Conflict ? Conflict(response) : BadRequest(response);
    }
}
