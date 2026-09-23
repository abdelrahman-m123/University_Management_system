namespace UMS.Api.Models;

public class StaffProfile
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string? ContactInfo { get; set; }
    public string? ProfileLink { get; set; }
    public string? OfficeLocation { get; set; }
    public DateTime? OfficeHours { get; set; }
    public string? Specialization { get; set; }
    public int? Rating { get; set; }
    public int? NumberOfResearchPapers { get; set; }
    public bool RemoteWork { get; set; }

    public ICollection<StaffCourse> StaffCourses { get; set; } = [];
}
