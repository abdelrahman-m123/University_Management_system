using UMS.Api.DTOs.Enrollments;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Enrollments;

public interface IEnrollmentService
{
    Task<List<EnrollmentResponse>> GetAllAsync();
    Task<List<EnrollmentResponse>> GetByStudentIdAsync(int studentId);
    Task<ServiceResult<EnrollmentResponse>> RegisterAsync(CreateEnrollmentRequest request);
    Task<ServiceResult<EnrollmentResponse>> JoinWaitlistAsync(CreateEnrollmentRequest request);
    Task<ServiceResult<EnrollmentResponse>> LeaveWaitlistAsync(int offeringId, int studentId);
    Task<int> PromoteWaitlistsAsync(CancellationToken cancellationToken = default);
    Task<ServiceResult<EnrollmentResponse>> ReviewAsync(int offeringId, int studentId, ReviewEnrollmentRequest request);
    Task<ServiceResult<EnrollmentResponse>> RequestWithdrawalAsync(int offeringId, int studentId);
}
