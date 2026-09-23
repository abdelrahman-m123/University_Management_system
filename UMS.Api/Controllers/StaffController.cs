using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.Staff;
using UMS.Api.Models;
using UMS.Api.Services.Common;
using UMS.Api.Services.Staff;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/staff")]
public class StaffController(IStaffService staffService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<StaffResponse>>> GetAll()
    {
        return Ok(await staffService.GetAllAsync());
    }

    [HttpGet("{userId:int}")]
    public async Task<ActionResult<StaffResponse>> GetByUserId(int userId)
    {
        var result = await staffService.GetByUserIdAsync(userId);
        return result.IsSuccess ? Ok(result.Data) : NotFound(new { success = false, message = result.Message });
    }

    [HttpPut("{userId:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<StaffResponse>> Update(int userId, UpdateStaffProfileRequest request)
    {
        var result = await staffService.UpdateAsync(userId, request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    private ActionResult ToErrorResponse<T>(ServiceResult<T> result)
    {
        var response = new { success = false, message = result.Message };
        return result.Status == ResultStatus.NotFound ? NotFound(response) : BadRequest(response);
    }
}
