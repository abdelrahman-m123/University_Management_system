using UMS.Api.DTOs.Students;
using UMS.Api.Models;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.StudentProfiles;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Students;

public class StudentService(IStudentProfileRepository studentProfiles, IUnitOfWork unitOfWork) : IStudentService
{
    public async Task<List<StudentResponse>> GetAllAsync()
    {
        var profiles = await studentProfiles.GetAllWithUsersAsync();
        return profiles.Select(ToResponse).ToList();
    }

    public async Task<ServiceResult<StudentResponse>> GetByUserIdAsync(int userId)
    {
        var profile = await studentProfiles.GetByUserIdWithUserAsync(userId);
        return profile is null
            ? ServiceResult<StudentResponse>.Failure(ResultStatus.NotFound, "Student not found")
            : ServiceResult<StudentResponse>.Success(ToResponse(profile), "Student retrieved successfully");
    }

    public async Task<ServiceResult<StudentResponse>> UpdateAsync(int userId, UpdateStudentProfileRequest request)
    {
        var profile = await studentProfiles.GetByUserIdWithUserAsync(userId);
        if (profile is null)
        {
            return ServiceResult<StudentResponse>.Failure(ResultStatus.NotFound, "Student not found");
        }

        profile.User.FullName = request.FullName.Trim();
        profile.User.PhoneNumber = request.PhoneNumber?.Trim();
        profile.User.UpdatedAt = DateTime.UtcNow;
        profile.Gpa = request.Gpa;
        profile.AcademicWarning = request.AcademicWarning;
        profile.HousingType = request.HousingType?.Trim();
        profile.ScholarshipStatus = request.ScholarshipStatus;

        await unitOfWork.SaveChangesAsync();
        return ServiceResult<StudentResponse>.Success(ToResponse(profile), "Student profile updated successfully");
    }

    private static StudentResponse ToResponse(StudentProfile profile)
    {
        return new StudentResponse
        {
            UserId = profile.UserId,
            FullName = profile.User.FullName,
            Email = profile.User.Email,
            PhoneNumber = profile.User.PhoneNumber,
            Gpa = profile.Gpa,
            AcademicWarning = profile.AcademicWarning,
            HousingType = profile.HousingType,
            ScholarshipStatus = profile.ScholarshipStatus
        };
    }
}
