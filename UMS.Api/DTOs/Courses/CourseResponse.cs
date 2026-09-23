namespace UMS.Api.DTOs.Courses;

public class CourseResponse
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int CreditHours { get; set; }
    public int MaxRegisteredStudents { get; set; }
}
