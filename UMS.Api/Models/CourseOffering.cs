namespace UMS.Api.Models;

public class CourseOffering
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public int SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;
    public int Capacity { get; set; }
    public bool IsPublished { get; set; }
    public ICollection<CourseEnrollment> Enrollments { get; set; } = [];
    public ICollection<StaffCourse> StaffCourses { get; set; } = [];
    public ICollection<Quiz> Quizzes { get; set; } = [];
    public ICollection<Announcement> Announcements { get; set; } = [];
    public ICollection<Questionnaire> Questionnaires { get; set; } = [];
    public ICollection<CourseContent> Contents { get; set; } = [];
}
