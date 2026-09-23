using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Courses;

public class UpdateCourseRequest
{
    [Required]
    [StringLength(30)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Range(2, 4)]
    public int CreditHours { get; set; }

    [Range(1, 500)]
    public int MaxRegisteredStudents { get; set; } = 200;
}
