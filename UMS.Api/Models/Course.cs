namespace UMS.Api.Models;

public class Course
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int CreditHours { get; set; }
    public int MaxRegisteredStudents { get; set; } = 200;

    public ICollection<CourseOffering> Offerings { get; set; } = [];
}
