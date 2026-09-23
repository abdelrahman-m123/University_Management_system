namespace UMS.Api.Models;

public class AcademicYear
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public ICollection<Semester> Semesters { get; set; } = [];
}
