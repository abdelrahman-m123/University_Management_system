using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Staff;

public class UpdateStaffProfileRequest
{
    [StringLength(150)]
    public string FullName { get; set; } = string.Empty;

    [StringLength(25)]
    public string? PhoneNumber { get; set; }

    [StringLength(255)]
    public string? ContactInfo { get; set; }

    [StringLength(500)]
    public string? ProfileLink { get; set; }

    [StringLength(100)]
    public string? OfficeLocation { get; set; }

    public DateTime? OfficeHours { get; set; }

    [StringLength(100)]
    public string? Specialization { get; set; }

    public int? Rating { get; set; }
    public int? NumberOfResearchPapers { get; set; }
    public bool RemoteWork { get; set; }
}
