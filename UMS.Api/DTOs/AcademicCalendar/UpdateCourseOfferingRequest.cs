using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.AcademicCalendar;

public class UpdateCourseOfferingRequest
{
    [Range(1, 10000)]
    public int Capacity { get; set; }
    public bool IsPublished { get; set; }
}
