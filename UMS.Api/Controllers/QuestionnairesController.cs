using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.Models;
using UMS.Api.DTOs.Questionnaires;
using UMS.Api.Services.Common;
using UMS.Api.Services.Questionnaires;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/questionnaires")]
public class QuestionnairesController(IQuestionnaireService questionnaireService) : ControllerBase
{
    [HttpGet("offerings/{offeringId:int}")]
    public async Task<ActionResult<List<QuestionnaireResponse>>> GetByCourseId(int offeringId)
    {
        return Ok(await questionnaireService.GetByCourseIdAsync(offeringId));
    }

    [HttpPost]
    [Authorize(Roles = $"{AppRoles.Doctor},{AppRoles.TeachingAssistant},{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<QuestionnaireResponse>> Create(CreateQuestionnaireRequest request)
    {
        var result = await questionnaireService.CreateAsync(request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Doctor},{AppRoles.TeachingAssistant},{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await questionnaireService.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : ToErrorResponse(result);
    }

    private ActionResult ToErrorResponse<T>(ServiceResult<T> result)
    {
        var response = new { success = false, message = result.Message };
        return result.Status == ResultStatus.NotFound ? NotFound(response) : BadRequest(response);
    }
}
