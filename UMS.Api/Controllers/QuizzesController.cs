using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UMS.Api.DTOs.Quizzes;
using UMS.Api.Models;
using UMS.Api.Services.Common;
using UMS.Api.Services.Quizzes;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/quizzes")]
public class QuizzesController(IQuizService quizService) : ControllerBase
{
    [HttpGet("offerings/{offeringId:int}")]
    public async Task<ActionResult<List<QuizResponse>>> GetByCourseId(int offeringId)
    {
        return Ok(await quizService.GetByCourseIdAsync(offeringId));
    }

    [HttpGet("{quizId:int}/grades")]
    public async Task<ActionResult<List<QuizGradeResponse>>> GetGrades(int quizId)
    {
        return Ok(await quizService.GetGradesAsync(quizId));
    }

    [HttpPost]
    [Authorize(Roles = $"{AppRoles.Doctor},{AppRoles.TeachingAssistant},{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<QuizResponse>> Create(CreateQuizRequest request)
    {
        var result = await quizService.CreateAsync(request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Doctor},{AppRoles.TeachingAssistant},{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<QuizResponse>> Update(int id, UpdateQuizRequest request)
    {
        var result = await quizService.UpdateAsync(id, request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpPost("{quizId:int}/grades")]
    [Authorize(Roles = $"{AppRoles.Doctor},{AppRoles.TeachingAssistant},{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<QuizGradeResponse>> Grade(int quizId, GradeQuizRequest request)
    {
        var result = await quizService.GradeAsync(quizId, request);
        return result.IsSuccess ? Ok(result.Data) : ToErrorResponse(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Doctor},{AppRoles.TeachingAssistant},{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await quizService.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : ToErrorResponse(result);
    }

    private ActionResult ToErrorResponse<T>(ServiceResult<T> result)
    {
        var response = new { success = false, message = result.Message };
        return result.Status switch
        {
            ResultStatus.NotFound => NotFound(response),
            ResultStatus.Conflict => Conflict(response),
            ResultStatus.ValidationError => BadRequest(response),
            _ => BadRequest(response)
        };
    }
}
