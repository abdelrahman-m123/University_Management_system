using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Enrollments;

public class CreateEnrollmentRequest
{
    [Required]
    public int CourseOfferingId { get; set; }

    [Required]
    public int StudentId { get; set; }
}
