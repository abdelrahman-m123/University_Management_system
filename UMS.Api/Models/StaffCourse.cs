namespace UMS.Api.Models;

public class StaffCourse
{
    public int StaffId { get; set; }
    public StaffProfile Staff { get; set; } = null!;

    public int CourseOfferingId { get; set; }
    public CourseOffering CourseOffering { get; set; } = null!;

    public string? AssignmentRole { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}
