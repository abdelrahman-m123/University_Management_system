using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.DTOs.Announcements;
using UMS.Api.Models;
using UMS.Api.Repositories.Announcements;
using UMS.Api.Repositories.Comments;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.Users;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Announcements;

public class AnnouncementService(
    IAnnouncementRepository announcements,
    ICommentRepository comments,
    ApplicationDbContext db,
    IUserRepository users,
    IUnitOfWork unitOfWork) : IAnnouncementService
{
    public async Task<List<AnnouncementResponse>> GetByCourseIdAsync(int courseId)
    {
        var announcementList = await announcements.GetByCourseIdAsync(courseId);
        return announcementList.Select(ToResponse).ToList();
    }

    public async Task<ServiceResult<AnnouncementResponse>> CreateAsync(CreateAnnouncementRequest request)
    {
        if (!await db.CourseOfferings.AnyAsync(item => item.Id == request.CourseOfferingId))
        {
            return ServiceResult<AnnouncementResponse>.Failure(ResultStatus.NotFound, "Course not found");
        }

        if (await users.GetByIdAsync(request.AuthorId) is null)
        {
            return ServiceResult<AnnouncementResponse>.Failure(ResultStatus.NotFound, "Author not found");
        }

        var announcement = new Announcement
        {
            CourseOfferingId = request.CourseOfferingId,
            AuthorId = request.AuthorId,
            Title = request.Title.Trim(),
            Content = request.Content.Trim()
        };

        await announcements.AddAsync(announcement);
        await unitOfWork.SaveChangesAsync();

        var savedAnnouncement = await announcements.GetByIdWithDetailsAsync(announcement.Id);
        return ServiceResult<AnnouncementResponse>.Success(ToResponse(savedAnnouncement!), "Announcement created successfully");
    }

    public async Task<ServiceResult<AnnouncementResponse>> UpdateAsync(int id, UpdateAnnouncementRequest request)
    {
        var announcement = await announcements.GetByIdWithDetailsAsync(id);
        if (announcement is null)
        {
            return ServiceResult<AnnouncementResponse>.Failure(ResultStatus.NotFound, "Announcement not found");
        }

        announcement.Title = request.Title.Trim();
        announcement.Content = request.Content.Trim();
        announcement.UpdatedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync();

        return ServiceResult<AnnouncementResponse>.Success(ToResponse(announcement), "Announcement updated successfully");
    }

    public async Task<ServiceResult<CommentResponse>> AddCommentAsync(int announcementId, CreateCommentRequest request)
    {
        if (await announcements.GetByIdAsync(announcementId) is null)
        {
            return ServiceResult<CommentResponse>.Failure(ResultStatus.NotFound, "Announcement not found");
        }

        if (await users.GetByIdAsync(request.AuthorId) is null)
        {
            return ServiceResult<CommentResponse>.Failure(ResultStatus.NotFound, "Author not found");
        }

        var comment = new Comment
        {
            AnnouncementId = announcementId,
            AuthorId = request.AuthorId,
            Content = request.Content.Trim()
        };

        await comments.AddAsync(comment);
        await unitOfWork.SaveChangesAsync();

        var savedAnnouncement = await announcements.GetByIdWithDetailsAsync(announcementId);
        var savedComment = savedAnnouncement!.Comments.Single(existingComment => existingComment.Id == comment.Id);
        return ServiceResult<CommentResponse>.Success(ToCommentResponse(savedComment), "Comment added successfully");
    }

    public async Task<ServiceResult<object>> DeleteAsync(int id)
    {
        var announcement = await announcements.GetByIdAsync(id);
        if (announcement is null)
        {
            return ServiceResult<object>.Failure(ResultStatus.NotFound, "Announcement not found");
        }

        announcements.Remove(announcement);
        await unitOfWork.SaveChangesAsync();
        return ServiceResult<object>.Success(new object(), "Announcement deleted successfully");
    }

    public async Task<ServiceResult<object>> DeleteCommentAsync(int commentId)
    {
        var comment = await comments.GetByIdAsync(commentId);
        if (comment is null)
        {
            return ServiceResult<object>.Failure(ResultStatus.NotFound, "Comment not found");
        }

        comments.Remove(comment);
        await unitOfWork.SaveChangesAsync();
        return ServiceResult<object>.Success(new object(), "Comment deleted successfully");
    }

    public async Task<ServiceResult<CommentResponse>> UpdateCommentAsync(int commentId, UpdateCommentRequest request)
    {
        var comment = await comments.GetByIdAsync(commentId);
        if (comment is null)
        {
            return ServiceResult<CommentResponse>.Failure(ResultStatus.NotFound, "Comment not found");
        }

        comment.Content = request.Content.Trim();
        comment.UpdatedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync();

        return ServiceResult<CommentResponse>.Success(ToCommentResponse(comment), "Comment updated successfully");
    }

    private static AnnouncementResponse ToResponse(Announcement announcement)
    {
        return new AnnouncementResponse
        {
            Id = announcement.Id,
            CourseId = announcement.CourseOffering.CourseId,
            CourseOfferingId = announcement.CourseOfferingId,
            CourseCode = announcement.CourseOffering.Course.Code,
            AuthorId = announcement.AuthorId,
            AuthorName = announcement.Author.FullName,
            AuthorEmail = announcement.Author.Email,
            Title = announcement.Title,
            Content = announcement.Content,
            CreatedAt = announcement.CreatedAt,
            Comments = announcement.Comments.Select(ToCommentResponse).ToList()
        };
    }

    private static CommentResponse ToCommentResponse(Comment comment)
    {
        return new CommentResponse
        {
            Id = comment.Id,
            AuthorId = comment.AuthorId,
            AuthorName = comment.Author.FullName,
            AuthorEmail = comment.Author.Email,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }
}
