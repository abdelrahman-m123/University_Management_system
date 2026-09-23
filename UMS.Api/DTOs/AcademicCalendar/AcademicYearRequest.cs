using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.AcademicCalendar;

public class AcademicYearRequest
{
    [Required, StringLength(30)]
    public string Name { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
}
