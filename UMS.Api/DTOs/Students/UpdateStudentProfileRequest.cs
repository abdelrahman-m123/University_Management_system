using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Students;

public class UpdateStudentProfileRequest
{
    [StringLength(150)]
    public string FullName { get; set; } = string.Empty;

    [StringLength(25)]
    public string? PhoneNumber { get; set; }

    [Range(0, 4)]
    public decimal? Gpa { get; set; }

    public bool AcademicWarning { get; set; }

    [StringLength(50)]
    public string? HousingType { get; set; }

    public bool ScholarshipStatus { get; set; }
}
