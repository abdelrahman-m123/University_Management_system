using UMS.Api.Models;

namespace UMS.Api.DTOs.Enrollments;

public class EnrollmentResponse
{
    public int CourseId { get; set; }
    public int CourseOfferingId { get; set; }
    public int SemesterId { get; set; }
    public string SemesterName { get; set; } = string.Empty;
    public string SemesterPhase { get; set; } = string.Empty;
    public bool CanRequestWithdrawal { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public int CreditHours { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public EnrollmentStatus Status { get; set; }
    public int? MidtermGrade { get; set; }
    public int? ClassworkGrade { get; set; }
    public int? QuizzesGrade { get; set; }
    public int? FinalGrade { get; set; }
    public string? LetterGrade { get; set; }
    public int? WaitlistPosition { get; set; }
    public DateTime? WaitlistedAt { get; set; }
}
