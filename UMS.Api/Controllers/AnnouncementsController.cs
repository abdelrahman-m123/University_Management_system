using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.Announcements;
using UMS.Api.Services.Announcements;
using UMS.Api.Services.Common;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/announcements")]
public class AnnouncementsController(IAnnouncementService announcementService) : ControllerBase
{
    [HttpGet("offerings/{offeringId:int}")]
    public async Task<ActionResult<List<AnnouncementResponse>>> GetByCourseId(int offeringId)
    {
        return Ok(await announcementService.GetByCourseIdAsync(offeringId));
    }

    [HttpPost]
    public async Task<ActionResult<AnnouncementResponse>> Create(CreateAnnouncementRequest request)
    {
        var result = await announcementService.CreateAsync(request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AnnouncementResponse>> Update(int id, UpdateAnnouncementRequest request)
    {
        var result = await announcementService.UpdateAsync(id, request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpPost("{announcementId:int}/comments")]
    public async Task<ActionResult<CommentResponse>> AddComment(int announcementId, CreateCommentRequest request)
    {
        var result = await announcementService.AddCommentAsync(announcementId, request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await announcementService.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : ToErrorResponse(result);
    }

    [HttpDelete("comments/{commentId:int}")]
    public async Task<IActionResult> DeleteComment(int commentId)
    {
        var result = await announcementService.DeleteCommentAsync(commentId);
        return result.IsSuccess ? NoContent() : ToErrorResponse(result);
    }

    [HttpPut("comments/{commentId:int}")]
    public async Task<ActionResult<CommentResponse>> UpdateComment(int commentId, UpdateCommentRequest request)
    {
        var result = await announcementService.UpdateCommentAsync(commentId, request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    private ActionResult ToErrorResponse<T>(ServiceResult<T> result)
    {
        var response = new { success = false, message = result.Message };
        return result.Status == ResultStatus.NotFound ? NotFound(response) : BadRequest(response);
    }
}
