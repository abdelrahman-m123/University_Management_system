namespace UMS.Api.DTOs.StaffCourses;

public class StaffCourseResponse
{
    public int StaffId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public string StaffEmail { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public int CourseOfferingId { get; set; }
    public int SemesterId { get; set; }
    public string SemesterName { get; set; } = string.Empty;
    public string CourseCode { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public int CreditHours { get; set; }
    public string? AssignmentRole { get; set; }
    public DateTime AssignedAt { get; set; }
}
