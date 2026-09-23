using System.ComponentModel.DataAnnotations;
using UMS.Api.Models;

namespace UMS.Api.DTOs.Enrollments;

public class ReviewEnrollmentRequest
{
    public EnrollmentStatus? Status { get; set; }

    [Range(0, 100)]
    public int? MidtermGrade { get; set; }

    [Range(0, 100)]
    public int? ClassworkGrade { get; set; }

    [Range(0, 100)]
    public int? QuizzesGrade { get; set; }
}
