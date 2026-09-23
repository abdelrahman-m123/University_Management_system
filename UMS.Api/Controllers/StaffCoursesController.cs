using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.StaffCourses;
using UMS.Api.Models;
using UMS.Api.Services.Common;
using UMS.Api.Services.StaffCourses;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/staff-courses")]
public class StaffCoursesController(IStaffCourseService staffCourseService) : ControllerBase
{
    [HttpGet("staff/{staffId:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin},{AppRoles.Doctor},{AppRoles.TeachingAssistant}")]
    public async Task<ActionResult<List<StaffCourseResponse>>> GetByStaffId(int staffId)
    {
        return Ok(await staffCourseService.GetByStaffIdAsync(staffId));
    }

    [HttpGet("offerings/{offeringId:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin},{AppRoles.Doctor},{AppRoles.TeachingAssistant},{AppRoles.Student}")]
    public async Task<ActionResult<List<StaffCourseResponse>>> GetByCourseId(int offeringId)
    {
        return Ok(await staffCourseService.GetByCourseIdAsync(offeringId));
    }

    [HttpPost]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<StaffCourseResponse>> Assign(AssignStaffCourseRequest request)
    {
        var result = await staffCourseService.AssignAsync(request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpDelete("staff/{staffId:int}/offerings/{offeringId:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<IActionResult> Unassign(int staffId, int offeringId)
    {
        var result = await staffCourseService.UnassignAsync(staffId, offeringId);
        return result.IsSuccess ? NoContent() : ToErrorResponse(result);
    }

    private ActionResult ToErrorResponse<T>(ServiceResult<T> result)
    {
        var response = new { success = false, message = result.Message };
        return result.Status switch
        {
            ResultStatus.NotFound => NotFound(response),
            ResultStatus.Conflict => Conflict(response),
            _ => BadRequest(response)
        };
    }
}
