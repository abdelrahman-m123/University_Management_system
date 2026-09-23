using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.DTOs.StaffCourses;
using UMS.Api.Models;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.StaffCourses;
using UMS.Api.Repositories.StaffProfiles;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.StaffCourses;

public class StaffCourseService(
    IStaffCourseRepository staffCourses,
    IStaffProfileRepository staffProfiles,
    ApplicationDbContext db,
    IUnitOfWork unitOfWork) : IStaffCourseService
{
    public async Task<List<StaffCourseResponse>> GetByStaffIdAsync(int staffId)
    {
        var assignments = await staffCourses.GetByStaffIdAsync(staffId);
        return assignments.Select(ToResponse).ToList();
    }

    public async Task<List<StaffCourseResponse>> GetByCourseIdAsync(int courseId)
    {
        var assignments = await staffCourses.GetByCourseIdAsync(courseId);
        return assignments.Select(ToResponse).ToList();
    }

    public async Task<ServiceResult<StaffCourseResponse>> AssignAsync(AssignStaffCourseRequest request)
    {
        if (await staffProfiles.GetByUserIdWithUserAsync(request.StaffId) is null)
        {
            return ServiceResult<StaffCourseResponse>.Failure(ResultStatus.NotFound, "Staff member not found");
        }

        if (!await db.CourseOfferings.AnyAsync(offering => offering.Id == request.CourseOfferingId))
        {
            return ServiceResult<StaffCourseResponse>.Failure(ResultStatus.NotFound, "Course not found");
        }

        if (await staffCourses.ExistsAsync(request.StaffId, request.CourseOfferingId))
        {
            return ServiceResult<StaffCourseResponse>.Failure(ResultStatus.Conflict, "Staff member is already assigned to this course");
        }

        var assignment = new StaffCourse
        {
            StaffId = request.StaffId,
            CourseOfferingId = request.CourseOfferingId,
            AssignmentRole = request.AssignmentRole?.Trim()
        };

        await staffCourses.AddAsync(assignment);
        await unitOfWork.SaveChangesAsync();

        var savedAssignment = await staffCourses.GetByIdsWithDetailsAsync(request.StaffId, request.CourseOfferingId);
        return ServiceResult<StaffCourseResponse>.Success(ToResponse(savedAssignment!), "Staff assigned to course successfully");
    }

    public async Task<ServiceResult<object>> UnassignAsync(int staffId, int courseId)
    {
        var assignment = await staffCourses.GetByIdsAsync(staffId, courseId);
        if (assignment is null)
        {
            return ServiceResult<object>.Failure(ResultStatus.NotFound, "Staff course assignment not found");
        }

        staffCourses.Remove(assignment);
        await unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Success(new object(), "Staff unassigned from course successfully");
    }

    private static StaffCourseResponse ToResponse(StaffCourse staffCourse)
    {
        return new StaffCourseResponse
        {
            StaffId = staffCourse.StaffId,
            StaffName = staffCourse.Staff.User.FullName,
            StaffEmail = staffCourse.Staff.User.Email,
            CourseId = staffCourse.CourseOffering.CourseId,
            CourseOfferingId = staffCourse.CourseOfferingId,
            SemesterId = staffCourse.CourseOffering.SemesterId,
            SemesterName = staffCourse.CourseOffering.Semester.Name,
            CourseCode = staffCourse.CourseOffering.Course.Code,
            CourseName = staffCourse.CourseOffering.Course.Name,
            CreditHours = staffCourse.CourseOffering.Course.CreditHours,
            AssignmentRole = staffCourse.AssignmentRole,
            AssignedAt = staffCourse.AssignedAt
        };
    }
}
