using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.CourseContents;
using UMS.Api.Models;
using UMS.Api.Services.Common;
using UMS.Api.Services.CourseContents;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/course-contents")]
public class CourseContentsController(ICourseContentService courseContentService) : ControllerBase
{
    [HttpGet("offerings/{offeringId:int}")]
    public async Task<ActionResult<List<CourseContentResponse>>> GetByCourseId(int offeringId)
    {
        return Ok(await courseContentService.GetByCourseIdAsync(offeringId));
    }

    [HttpPost("offerings/{offeringId:int}")]
    [Authorize(Roles = $"{AppRoles.Doctor},{AppRoles.TeachingAssistant},{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<CourseContentResponse>> Upload(int offeringId, IFormFile file)
    {
        var result = await courseContentService.UploadAsync(offeringId, file);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var result = await courseContentService.GetFileAsync(id);
        if (!result.IsSuccess)
        {
            return ToErrorResponse(result);
        }

        var content = result.Data!;
        return File(content.FileData, content.ContentType, content.FileName);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Doctor},{AppRoles.TeachingAssistant},{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await courseContentService.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : ToErrorResponse(result);
    }

    private ActionResult ToErrorResponse<T>(ServiceResult<T> result)
    {
        var response = new { success = false, message = result.Message };
        return result.Status == ResultStatus.NotFound ? NotFound(response) : BadRequest(response);
    }
}
