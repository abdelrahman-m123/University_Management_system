using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.AcademicCalendar;

public class CourseOfferingRequest
{
    [Range(1, int.MaxValue)]
    public int CourseId { get; set; }
    [Range(1, int.MaxValue)]
    public int SemesterId { get; set; }
    [Range(1, 10000)]
    public int? Capacity { get; set; }
    public bool IsPublished { get; set; }
}
