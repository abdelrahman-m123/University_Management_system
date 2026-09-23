namespace UMS.Api.Models;

public class StudentProfile
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public decimal? Gpa { get; set; }
    public bool AcademicWarning { get; set; }
    public string? HousingType { get; set; }
    public bool ScholarshipStatus { get; set; }

    public ICollection<CourseEnrollment> Enrollments { get; set; } = [];
    public ICollection<QuizGrade> QuizGrades { get; set; } = [];
}
