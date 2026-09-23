using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.DTOs.CourseContents;
using UMS.Api.Models;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.CourseContents;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.CourseContents;

public class CourseContentService(
    ICourseContentRepository contents,
    ApplicationDbContext db,
    IUnitOfWork unitOfWork) : ICourseContentService
{
    private const long MaxFileSize = 10 * 1024 * 1024;

    public async Task<List<CourseContentResponse>> GetByCourseIdAsync(int courseId)
    {
        var contentList = await contents.GetByCourseIdAsync(courseId);
        return contentList.Select(ToResponse).ToList();
    }

    public async Task<ServiceResult<CourseContentResponse>> UploadAsync(int courseId, IFormFile file)
    {
        var offering = await db.CourseOfferings.Include(item => item.Course).SingleOrDefaultAsync(item => item.Id == courseId);
        if (offering is null)
        {
            return ServiceResult<CourseContentResponse>.Failure(ResultStatus.NotFound, "Course not found");
        }

        if (file.Length == 0)
        {
            return ServiceResult<CourseContentResponse>.Failure(ResultStatus.ValidationError, "File is empty");
        }

        if (file.Length > MaxFileSize)
        {
            return ServiceResult<CourseContentResponse>.Failure(ResultStatus.ValidationError, "File size cannot exceed 10 MB");
        }

        await using var stream = file.OpenReadStream();
        using var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream);

        var content = new CourseContent
        {
            CourseOfferingId = courseId,
            CourseOffering = offering,
            FileName = Path.GetFileName(file.FileName),
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            FileSize = file.Length,
            FileData = memoryStream.ToArray()
        };

        await contents.AddAsync(content);
        await unitOfWork.SaveChangesAsync();

        return ServiceResult<CourseContentResponse>.Success(ToResponse(content), "Course content uploaded successfully");
    }

    public async Task<ServiceResult<CourseContent>> GetFileAsync(int id)
    {
        var content = await contents.GetByIdAsync(id);
        return content is null
            ? ServiceResult<CourseContent>.Failure(ResultStatus.NotFound, "Course content not found")
            : ServiceResult<CourseContent>.Success(content, "Course content retrieved successfully");
    }

    public async Task<ServiceResult<object>> DeleteAsync(int id)
    {
        var content = await contents.GetByIdAsync(id);
        if (content is null)
        {
            return ServiceResult<object>.Failure(ResultStatus.NotFound, "Course content not found");
        }

        contents.Remove(content);
        await unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Success(new object(), "Course content deleted successfully");
    }

    private static CourseContentResponse ToResponse(CourseContent content)
    {
        return new CourseContentResponse
        {
            Id = content.Id,
            CourseId = content.CourseOffering.CourseId,
            CourseOfferingId = content.CourseOfferingId,
            FileName = content.FileName,
            ContentType = content.ContentType,
            FileSize = content.FileSize,
            UploadedAt = content.UploadedAt
        };
    }
}
