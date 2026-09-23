using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.Enrollments;
using UMS.Api.Models;
using UMS.Api.Services.Common;
using UMS.Api.Services.Enrollments;
using UMS.Api.Services.CurrentUser;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/enrollments")]
public class EnrollmentsController(IEnrollmentService enrollmentService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin},{AppRoles.Doctor},{AppRoles.TeachingAssistant}")]
    public async Task<ActionResult<List<EnrollmentResponse>>> GetAll()
    {
        return Ok(await enrollmentService.GetAllAsync());
    }

    [HttpGet("students/{studentId:int}")]
    public async Task<ActionResult<List<EnrollmentResponse>>> GetByStudentId(int studentId)
    {
        if (currentUser.UserId != studentId && !User.IsInRole(AppRoles.Admin) && !User.IsInRole(AppRoles.SuperAdmin) && !User.IsInRole(AppRoles.Doctor) && !User.IsInRole(AppRoles.TeachingAssistant)) return Forbid();
        return Ok(await enrollmentService.GetByStudentIdAsync(studentId));
    }

    [HttpPost]
    public async Task<ActionResult<EnrollmentResponse>> Register(CreateEnrollmentRequest request)
    {
        var result = await enrollmentService.RegisterAsync(request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpPut("{offeringId:int}/students/{studentId:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin},{AppRoles.Doctor},{AppRoles.TeachingAssistant}")]
    public async Task<ActionResult<EnrollmentResponse>> Review(int offeringId, int studentId, ReviewEnrollmentRequest request)
    {
        var result = await enrollmentService.ReviewAsync(offeringId, studentId, request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpPost("waitlist")]
    public async Task<ActionResult<EnrollmentResponse>> JoinWaitlist(CreateEnrollmentRequest request)
    {
        var result = await enrollmentService.JoinWaitlistAsync(request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpDelete("{offeringId:int}/students/{studentId:int}/waitlist")]
    public async Task<ActionResult<EnrollmentResponse>> LeaveWaitlist(int offeringId, int studentId)
    {
        if (currentUser.UserId != studentId) return Forbid();
        var result = await enrollmentService.LeaveWaitlistAsync(offeringId, studentId);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpPost("{offeringId:int}/students/{studentId:int}/withdraw")]
    public async Task<ActionResult<EnrollmentResponse>> RequestWithdrawal(int offeringId, int studentId)
    {
        if (currentUser.UserId != studentId) return Forbid();
        var result = await enrollmentService.RequestWithdrawalAsync(offeringId, studentId);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
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
