namespace UMS.Api.DTOs.Staff;

public class StaffResponse
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public List<string> Roles { get; set; } = [];
    public string? ContactInfo { get; set; }
    public string? ProfileLink { get; set; }
    public string? OfficeLocation { get; set; }
    public DateTime? OfficeHours { get; set; }
    public string? Specialization { get; set; }
}
