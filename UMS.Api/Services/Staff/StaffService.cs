using UMS.Api.DTOs.Staff;
using UMS.Api.Models;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.StaffProfiles;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Staff;

public class StaffService(IStaffProfileRepository staffProfiles, IUnitOfWork unitOfWork) : IStaffService
{
    public async Task<List<StaffResponse>> GetAllAsync()
    {
        var profiles = await staffProfiles.GetAllWithUsersAsync();
        return profiles.Select(ToResponse).ToList();
    }

    public async Task<ServiceResult<StaffResponse>> GetByUserIdAsync(int userId)
    {
        var profile = await staffProfiles.GetByUserIdWithUserAsync(userId);
        return profile is null
            ? ServiceResult<StaffResponse>.Failure(ResultStatus.NotFound, "Staff member not found")
            : ServiceResult<StaffResponse>.Success(ToResponse(profile), "Staff member retrieved successfully");
    }

    public async Task<ServiceResult<StaffResponse>> UpdateAsync(int userId, UpdateStaffProfileRequest request)
    {
        var profile = await staffProfiles.GetByUserIdWithUserAsync(userId);
        if (profile is null)
        {
            return ServiceResult<StaffResponse>.Failure(ResultStatus.NotFound, "Staff member not found");
        }

        profile.User.FullName = request.FullName.Trim();
        profile.User.PhoneNumber = request.PhoneNumber?.Trim();
        profile.User.UpdatedAt = DateTime.UtcNow;
        profile.ContactInfo = request.ContactInfo?.Trim();
        profile.ProfileLink = request.ProfileLink?.Trim();
        profile.OfficeLocation = request.OfficeLocation?.Trim();
        profile.OfficeHours = request.OfficeHours;
        profile.Specialization = request.Specialization?.Trim();
        profile.Rating = request.Rating;
        profile.NumberOfResearchPapers = request.NumberOfResearchPapers;
        profile.RemoteWork = request.RemoteWork;

        await unitOfWork.SaveChangesAsync();
        return ServiceResult<StaffResponse>.Success(ToResponse(profile), "Staff profile updated successfully");
    }

    private static StaffResponse ToResponse(StaffProfile profile)
    {
        return new StaffResponse
        {
            UserId = profile.UserId,
            FullName = profile.User.FullName,
            Email = profile.User.Email,
            PhoneNumber = profile.User.PhoneNumber,
            Roles = profile.User.UserRoles.Select(userRole => userRole.Role.Name).ToList(),
            ContactInfo = profile.ContactInfo,
            ProfileLink = profile.ProfileLink,
            OfficeLocation = profile.OfficeLocation,
            OfficeHours = profile.OfficeHours,
            Specialization = profile.Specialization
        };
    }
}
