namespace UMS.Api.Models;

public class CourseEnrollment
{
    public int CourseOfferingId { get; set; }
    public CourseOffering CourseOffering { get; set; } = null!;

    public int StudentId { get; set; }
    public StudentProfile Student { get; set; } = null!;

    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Pending;
    public int? MidtermGrade { get; set; }
    public int? ClassworkGrade { get; set; }
    public int? QuizzesGrade { get; set; }
    public int? FinalGrade { get; set; }
    public string? LetterGrade { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public long? WaitlistSequence { get; set; }
    public DateTime? WaitlistedAt { get; set; }
}
