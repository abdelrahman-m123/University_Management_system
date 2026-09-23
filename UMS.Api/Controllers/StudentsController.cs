using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.Students;
using UMS.Api.Models;
using UMS.Api.Services.Common;
using UMS.Api.Services.Students;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/students")]
public class StudentsController(IStudentService studentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<StudentResponse>>> GetAll()
    {
        return Ok(await studentService.GetAllAsync());
    }

    [HttpGet("{userId:int}")]
    public async Task<ActionResult<StudentResponse>> GetByUserId(int userId)
    {
        var result = await studentService.GetByUserIdAsync(userId);
        return result.IsSuccess ? Ok(result.Data) : NotFound(new { success = false, message = result.Message });
    }

    [HttpPut("{userId:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<StudentResponse>> Update(int userId, UpdateStudentProfileRequest request)
    {
        var result = await studentService.UpdateAsync(userId, request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    private ActionResult ToErrorResponse<T>(ServiceResult<T> result)
    {
        var response = new { success = false, message = result.Message };
        return result.Status == ResultStatus.NotFound ? NotFound(response) : BadRequest(response);
    }
}
