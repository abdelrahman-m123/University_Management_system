using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.AcademicCalendar;

public class SemesterRequest
{
    [Required, StringLength(50)]
    public string Name { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public DateTimeOffset RegistrationOpensAt { get; set; }
    public DateTimeOffset RegistrationClosesAt { get; set; }
    public DateTimeOffset AddDropOpensAt { get; set; }
    public DateTimeOffset AddDropClosesAt { get; set; }
    public bool IsPublished { get; set; }
}
