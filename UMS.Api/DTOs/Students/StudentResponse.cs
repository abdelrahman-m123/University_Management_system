namespace UMS.Api.DTOs.Students;

public class StudentResponse
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public decimal? Gpa { get; set; }
    public bool AcademicWarning { get; set; }
    public string? HousingType { get; set; }
    public bool ScholarshipStatus { get; set; }
}
