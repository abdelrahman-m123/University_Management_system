using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.StaffCourses;

public class AssignStaffCourseRequest
{
    [Required]
    public int StaffId { get; set; }

    [Required]
    public int CourseOfferingId { get; set; }

    [StringLength(50)]
    public string? AssignmentRole { get; set; }
}
