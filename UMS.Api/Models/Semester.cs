namespace UMS.Api.Models;

public class Semester
{
    public int Id { get; set; }
    public int AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public DateTimeOffset RegistrationOpensAt { get; set; }
    public DateTimeOffset RegistrationClosesAt { get; set; }
    public DateTimeOffset AddDropOpensAt { get; set; }
    public DateTimeOffset AddDropClosesAt { get; set; }
    public bool IsPublished { get; set; }
    public ICollection<CourseOffering> Offerings { get; set; } = [];
}
