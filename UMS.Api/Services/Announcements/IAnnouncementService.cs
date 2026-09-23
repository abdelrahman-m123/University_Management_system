using UMS.Api.DTOs.Announcements;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Announcements;

public interface IAnnouncementService
{
    Task<List<AnnouncementResponse>> GetByCourseIdAsync(int courseId);
    Task<ServiceResult<AnnouncementResponse>> CreateAsync(CreateAnnouncementRequest request);
    Task<ServiceResult<AnnouncementResponse>> UpdateAsync(int id, UpdateAnnouncementRequest request);
    Task<ServiceResult<CommentResponse>> AddCommentAsync(int announcementId, CreateCommentRequest request);
    Task<ServiceResult<CommentResponse>> UpdateCommentAsync(int commentId, UpdateCommentRequest request);
    Task<ServiceResult<object>> DeleteAsync(int id);
    Task<ServiceResult<object>> DeleteCommentAsync(int commentId);
}
