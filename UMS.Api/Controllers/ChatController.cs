using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.Chats;
using UMS.Api.Models;
using UMS.Api.Services.Chat;
using UMS.Api.Services.Common;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize(Roles = $"{AppRoles.Student},{AppRoles.Doctor}")]
[Route("api/chats")]

public class ChatsController(IChatService chatService) : ControllerBase
{
    [HttpGet("messages")]
    public async Task<ActionResult<List<GetChatsResponse>>> GetMessagesByChattersIds(
        [FromQuery] int doctorId,
        [FromQuery] int studentId)
    {
        var result = await chatService.GetMessagesByChattersIdsAsync(doctorId, studentId);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpPost("messages")]
    public async Task<ActionResult<GetChatsResponse>> SendMessage(SendMessageRequest request)
    {
        var result = await chatService.SendMessageAsync(request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpGet("unread")]
    public async Task<ActionResult<List<ChatUnreadResponse>>> GetUnreadChats()
    {
        var result = await chatService.GetUnreadChatsAsync();
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpPost("messages/read")]
    public async Task<IActionResult> MarkMessagesAsRead(MarkMessagesReadRequest request)
    {
        var result = await chatService.MarkMessagesAsReadAsync(request.DoctorId, request.StudentId);
        return result.IsSuccess ? NoContent() : ToErrorResponse(result);
    }

    private ActionResult ToErrorResponse<T>(ServiceResult<T> result)
    {
        var response = new { success = false, message = result.Message };
        return result.Status switch
        {
            ResultStatus.NotFound => NotFound(response),
            ResultStatus.Forbidden => Forbid(),
            ResultStatus.Unauthorized => Unauthorized(response),
            _ => BadRequest(response)
        };
    }
}
