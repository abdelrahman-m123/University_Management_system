using System.Data;
using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.DTOs.Enrollments;
using UMS.Api.Models;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.CourseEnrollments;
using UMS.Api.Repositories.StudentProfiles;
using UMS.Api.Services.Common;
using UMS.Api.Services.AcademicCalendar;
using UMS.Api.Services.CurrentUser;

namespace UMS.Api.Services.Enrollments;

public class EnrollmentService(
    ICourseEnrollmentRepository enrollments,
    ApplicationDbContext db,
    IStudentProfileRepository students,
    ICurrentUserService currentUser,
    IUnitOfWork unitOfWork) : IEnrollmentService
{
    public async Task<List<EnrollmentResponse>> GetAllAsync()
    {
        var enrollmentList = await enrollments.GetAllWithDetailsAsync();
        return enrollmentList.Select(ToResponse).ToList();
    }

    public async Task<List<EnrollmentResponse>> GetByStudentIdAsync(int studentId)
    {
        var enrollmentList = await enrollments.GetByStudentIdWithCourseAsync(studentId);
        return enrollmentList.Select(ToResponse).ToList();
    }

    public async Task<ServiceResult<EnrollmentResponse>> RegisterAsync(CreateEnrollmentRequest request)
    {
        if (currentUser.UserId != request.StudentId)
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.ValidationError, "You can only register your own student account");
        var offering = await db.CourseOfferings.Include(item => item.Semester).Include(item => item.Course)
            .SingleOrDefaultAsync(item => item.Id == request.CourseOfferingId);
        if (offering is null)
        {
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.NotFound, "Course offering not found");
        }

        if (await students.GetByUserIdWithUserAsync(request.StudentId) is null)
        {
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.NotFound, "Student not found");
        }

        if (!offering.IsPublished || (!SemesterPhase.IsRegistrationOpen(offering.Semester, DateTimeOffset.UtcNow) &&
            !SemesterPhase.IsAddDropOpen(offering.Semester, DateTimeOffset.UtcNow)))
        {
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.ValidationError, "Registration is not open for this semester");
        }

        string? rejection = null;
        var executionStrategy = db.Database.CreateExecutionStrategy();
        var registered = await executionStrategy.ExecuteAsync(async () =>
        {
            await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            if (await enrollments.ExistsAsync(request.CourseOfferingId, request.StudentId))
            {
                rejection = "Student already has an application for this offering";
                await transaction.RollbackAsync();
                return false;
            }

            var occupiedSeats = await db.CourseEnrollments.CountAsync(item => item.CourseOfferingId == request.CourseOfferingId &&
                item.Status == EnrollmentStatus.Pending || item.Status == EnrollmentStatus.Accepted || item.Status == EnrollmentStatus.WithdrawalRequested);
            if (occupiedSeats >= offering.Capacity)
            {
                rejection = "This course offering is at capacity";
                await transaction.RollbackAsync();
                return false;
            }

            await enrollments.AddAsync(new CourseEnrollment { CourseOfferingId = request.CourseOfferingId, StudentId = request.StudentId });
            db.OutboxMessages.Add(new OutboxMessage { Type = "EnrollmentUpdated", CourseOfferingId = request.CourseOfferingId, Revision = DateTime.UtcNow.Ticks });
            await unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        });
        if (!registered)
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.Conflict, rejection ?? "Registration could not be completed");

        var savedEnrollment = await enrollments.GetByIdsWithDetailsAsync(request.CourseOfferingId, request.StudentId);
        return ServiceResult<EnrollmentResponse>.Success(ToResponse(savedEnrollment!), "Course registration submitted");
    }

    public async Task<ServiceResult<EnrollmentResponse>> JoinWaitlistAsync(CreateEnrollmentRequest request)
    {
        if (currentUser.UserId != request.StudentId)
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.ValidationError, "You can only join a waitlist with your own student account");

        var offering = await db.CourseOfferings.Include(item => item.Semester).Include(item => item.Course)
            .SingleOrDefaultAsync(item => item.Id == request.CourseOfferingId);
        if (offering is null) return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.NotFound, "Course offering not found");
        if (await students.GetByUserIdWithUserAsync(request.StudentId) is null)
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.NotFound, "Student not found");
        if (!offering.IsPublished || (!SemesterPhase.IsRegistrationOpen(offering.Semester, DateTimeOffset.UtcNow) && !SemesterPhase.IsAddDropOpen(offering.Semester, DateTimeOffset.UtcNow)))
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.ValidationError, "Registration is not open for this semester");

        string? rejection = null;
        var strategy = db.Database.CreateExecutionStrategy();
        var joined = await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var existing = await enrollments.GetByIdsWithDetailsAsync(request.CourseOfferingId, request.StudentId);
            if (existing is not null && existing.Status is not (EnrollmentStatus.Rejected or EnrollmentStatus.Withdrawn or EnrollmentStatus.WaitlistCancelled))
            {
                rejection = "Student already has an application for this offering";
                return false;
            }

            var occupied = await db.CourseEnrollments.CountAsync(item => item.CourseOfferingId == request.CourseOfferingId && (item.Status == EnrollmentStatus.Pending || item.Status == EnrollmentStatus.Accepted || item.Status == EnrollmentStatus.WithdrawalRequested));
            if (occupied < offering.Capacity)
            {
                rejection = "A seat is available; register for the course instead";
                return false;
            }

            var nextSequence = (await db.CourseEnrollments.Where(item => item.CourseOfferingId == request.CourseOfferingId).MaxAsync(item => (long?)item.WaitlistSequence) ?? 0) + 1;
            if (existing is null)
                await enrollments.AddAsync(new CourseEnrollment { CourseOfferingId = request.CourseOfferingId, StudentId = request.StudentId, Status = EnrollmentStatus.Waitlisted, WaitlistSequence = nextSequence, WaitlistedAt = DateTime.UtcNow });
            else
            {
                existing.Status = EnrollmentStatus.Waitlisted;
                existing.WaitlistSequence = nextSequence;
                existing.WaitlistedAt = DateTime.UtcNow;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            await unitOfWork.SaveChangesAsync();
            db.OutboxMessages.Add(new OutboxMessage { Type = "EnrollmentUpdated", CourseOfferingId = request.CourseOfferingId, Revision = DateTime.UtcNow.Ticks });
            await unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        });
        if (!joined) return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.Conflict, rejection ?? "Could not join waitlist");
        var saved = await enrollments.GetByIdsWithDetailsAsync(request.CourseOfferingId, request.StudentId);
        return ServiceResult<EnrollmentResponse>.Success(ToResponse(saved!), "Joined course waitlist");
    }

    public async Task<ServiceResult<EnrollmentResponse>> LeaveWaitlistAsync(int offeringId, int studentId)
    {
        if (currentUser.UserId != studentId)
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.ValidationError, "You can only leave your own waitlist entry");
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var enrollment = await enrollments.GetByIdsWithDetailsAsync(offeringId, studentId);
        if (enrollment is null || enrollment.Status != EnrollmentStatus.Waitlisted)
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.NotFound, "Waitlist entry not found");
        enrollment.Status = EnrollmentStatus.WaitlistCancelled;
        enrollment.WaitlistSequence = null;
        enrollment.UpdatedAt = DateTime.UtcNow;
        db.OutboxMessages.Add(new OutboxMessage { Type = "EnrollmentUpdated", CourseOfferingId = offeringId, Revision = DateTime.UtcNow.Ticks });
        await unitOfWork.SaveChangesAsync();
        await transaction.CommitAsync();
        return ServiceResult<EnrollmentResponse>.Success(ToResponse(enrollment), "Left course waitlist");
    }

    public async Task<int> PromoteWaitlistsAsync(CancellationToken cancellationToken = default)
    {
        var offeringIds = await db.CourseOfferings.Where(offering => offering.IsPublished && offering.Enrollments.Any(enrollment => enrollment.Status == EnrollmentStatus.Waitlisted)).Select(offering => offering.Id).ToListAsync(cancellationToken);
        var promoted = 0;
        foreach (var offeringId in offeringIds)
        {
            var strategy = db.Database.CreateExecutionStrategy();
            promoted += await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
                var offering = await db.CourseOfferings.Include(item => item.Semester).SingleAsync(item => item.Id == offeringId, cancellationToken);
                if (!offering.IsPublished || (!SemesterPhase.IsRegistrationOpen(offering.Semester, DateTimeOffset.UtcNow) && !SemesterPhase.IsAddDropOpen(offering.Semester, DateTimeOffset.UtcNow))) return 0;
                var occupied = await db.CourseEnrollments.CountAsync(item => item.CourseOfferingId == offeringId && (item.Status == EnrollmentStatus.Pending || item.Status == EnrollmentStatus.Accepted || item.Status == EnrollmentStatus.WithdrawalRequested), cancellationToken);
                if (occupied >= offering.Capacity) return 0;
                var next = await db.CourseEnrollments.Where(item => item.CourseOfferingId == offeringId && item.Status == EnrollmentStatus.Waitlisted).OrderBy(item => item.WaitlistSequence).ThenBy(item => item.WaitlistedAt).FirstOrDefaultAsync(cancellationToken);
                if (next is null) return 0;
                next.Status = EnrollmentStatus.Pending; next.UpdatedAt = DateTime.UtcNow;
                db.OutboxMessages.Add(new OutboxMessage { Type = "EnrollmentUpdated", CourseOfferingId = offeringId, Revision = DateTime.UtcNow.Ticks });
                await unitOfWork.SaveChangesAsync(); await transaction.CommitAsync(cancellationToken); return 1;
            });
        }
        return promoted;
    }

    public async Task<ServiceResult<EnrollmentResponse>> ReviewAsync(int offeringId, int studentId, ReviewEnrollmentRequest request)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var enrollment = await enrollments.GetByIdsWithDetailsAsync(offeringId, studentId);
        if (enrollment is null)
        {
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.NotFound, "Enrollment not found");
        }

        if (request.Status.HasValue)
        {
            if (enrollment.Status == EnrollmentStatus.WithdrawalRequested)
            {
                if (request.Status is not (EnrollmentStatus.Accepted or EnrollmentStatus.Withdrawn))
                    return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.ValidationError, "Withdrawal requests can only be approved or rejected");
                enrollment.Status = request.Status == EnrollmentStatus.Withdrawn ? EnrollmentStatus.Withdrawn : EnrollmentStatus.Accepted;
            }
            else if (enrollment.Status == EnrollmentStatus.Pending && request.Status is EnrollmentStatus.Accepted or EnrollmentStatus.Rejected)
                enrollment.Status = request.Status.Value;
            else if (request.Status != enrollment.Status)
                return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.ValidationError, "Invalid enrollment status transition");

            if (enrollment.Status == EnrollmentStatus.Accepted)
            {
                var occupied = await db.CourseEnrollments.CountAsync(item => item.CourseOfferingId == offeringId && item.StudentId != studentId && (item.Status == EnrollmentStatus.Pending || item.Status == EnrollmentStatus.Accepted || item.Status == EnrollmentStatus.WithdrawalRequested));
                var offering = await db.CourseOfferings.AsNoTracking().SingleAsync(item => item.Id == offeringId);
                if (occupied >= offering.Capacity) return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.Conflict, "This course offering is at capacity");
            }
        }

        if (request.MidtermGrade.HasValue)
        {
            enrollment.MidtermGrade = request.MidtermGrade.Value;
        }

        if (request.ClassworkGrade.HasValue)
        {
            enrollment.ClassworkGrade = request.ClassworkGrade.Value;
        }

        if (request.QuizzesGrade.HasValue)
        {
            enrollment.QuizzesGrade = request.QuizzesGrade.Value;
        }

        if (enrollment.MidtermGrade.HasValue && enrollment.ClassworkGrade.HasValue && enrollment.QuizzesGrade.HasValue)
        {
            enrollment.FinalGrade = enrollment.MidtermGrade.Value + enrollment.ClassworkGrade.Value + enrollment.QuizzesGrade.Value;
            enrollment.LetterGrade = enrollment.FinalGrade switch
            {
                >= 90 => "A",
                >= 80 => "B",
                >= 70 => "C",
                >= 60 => "D",
                _ => "F"
            };
        }
        enrollment.UpdatedAt = DateTime.UtcNow;
        db.OutboxMessages.Add(new OutboxMessage { Type = "EnrollmentUpdated", CourseOfferingId = offeringId, Revision = DateTime.UtcNow.Ticks });
        await unitOfWork.SaveChangesAsync();
        await transaction.CommitAsync();

        return ServiceResult<EnrollmentResponse>.Success(ToResponse(enrollment), "Enrollment reviewed successfully");
    }

    public async Task<ServiceResult<EnrollmentResponse>> RequestWithdrawalAsync(int offeringId, int studentId)
    {
        var enrollment = await enrollments.GetByIdsWithDetailsAsync(offeringId, studentId);
        if (enrollment is null)
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.NotFound, "Enrollment not found");
        if (enrollment.Status != EnrollmentStatus.Accepted)
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.Conflict, "Only accepted enrollments can be withdrawn");
        if (!SemesterPhase.IsAddDropOpen(enrollment.CourseOffering.Semester, DateTimeOffset.UtcNow))
            return ServiceResult<EnrollmentResponse>.Failure(ResultStatus.ValidationError, "The add/drop period is closed");
        enrollment.Status = EnrollmentStatus.WithdrawalRequested;
        enrollment.UpdatedAt = DateTime.UtcNow;
        db.OutboxMessages.Add(new OutboxMessage { Type = "EnrollmentUpdated", CourseOfferingId = offeringId, Revision = DateTime.UtcNow.Ticks });
        await unitOfWork.SaveChangesAsync();
        return ServiceResult<EnrollmentResponse>.Success(ToResponse(enrollment), "Withdrawal request submitted");
    }

    private static EnrollmentResponse ToResponse(CourseEnrollment enrollment)
    {
        return new EnrollmentResponse
        {
            CourseId = enrollment.CourseOffering.CourseId,
            CourseOfferingId = enrollment.CourseOfferingId,
            SemesterId = enrollment.CourseOffering.SemesterId,
            SemesterName = enrollment.CourseOffering.Semester.Name,
            SemesterPhase = SemesterPhase.Get(enrollment.CourseOffering.Semester, DateTimeOffset.UtcNow),
            CanRequestWithdrawal = enrollment.Status == EnrollmentStatus.Accepted && SemesterPhase.IsAddDropOpen(enrollment.CourseOffering.Semester, DateTimeOffset.UtcNow),
            CourseCode = enrollment.CourseOffering.Course.Code,
            CourseName = enrollment.CourseOffering.Course.Name,
            CreditHours = enrollment.CourseOffering.Course.CreditHours,
            StudentId = enrollment.StudentId,
            StudentName = enrollment.Student.User.FullName,
            StudentEmail = enrollment.Student.User.Email,
            Status = enrollment.Status,
            MidtermGrade = enrollment.MidtermGrade,
            ClassworkGrade = enrollment.ClassworkGrade,
            QuizzesGrade = enrollment.QuizzesGrade,
            FinalGrade = enrollment.FinalGrade,
            LetterGrade = enrollment.LetterGrade
            ,WaitlistedAt = enrollment.WaitlistedAt
        };
    }
}
