using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.Courses;
using UMS.Api.Models;
using UMS.Api.Services.Common;
using UMS.Api.Services.Courses;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/courses")]
public class CoursesController(ICourseService courseService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CourseResponse>>> GetAll()
    {
        var courses = await courseService.GetAllAsync();
        return Ok(courses);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CourseResponse>> GetById(int id)
    {
        var result = await courseService.GetByIdAsync(id);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return ToErrorResponse(result);
    }

    [HttpPost]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<CourseResponse>> Create(CreateCourseRequest request)
    {
        var result = await courseService.CreateAsync(request);

        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
        }

        return ToErrorResponse(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<CourseResponse>> Update(int id, UpdateCourseRequest request)
    {
        var result = await courseService.UpdateAsync(id, request);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return ToErrorResponse(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await courseService.DeleteAsync(id);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        return ToErrorResponse(result);
    }

    private ActionResult ToErrorResponse<T>(ServiceResult<T> result)
    {
        var response = new
        {
            success = false,
            message = result.Message
        };

        return result.Status switch
        {
            ResultStatus.NotFound => NotFound(response),
            ResultStatus.Conflict => Conflict(response),
            ResultStatus.ValidationError => BadRequest(response),
            ResultStatus.Unauthorized => Unauthorized(response),
            ResultStatus.Forbidden => Forbid(),
            _ => BadRequest(response)
        };
    }
}
