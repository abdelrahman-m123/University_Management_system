namespace UMS.Api.DTOs.AcademicCalendar;

public record AcademicYearResponse(int Id, string Name, DateTime StartsAt, DateTime EndsAt);

public record SemesterResponse(
    int Id,
    int AcademicYearId,
    string AcademicYearName,
    string Name,
    DateTime StartsAt,
    DateTime EndsAt,
    DateTimeOffset RegistrationOpensAt,
    DateTimeOffset RegistrationClosesAt,
    DateTimeOffset AddDropOpensAt,
    DateTimeOffset AddDropClosesAt,
    bool IsPublished,
    string Phase);

public record CourseOfferingResponse(
    int OfferingId,
    int CourseId,
    string CourseCode,
    string CourseName,
    int CreditHours,
    int SemesterId,
    string SemesterName,
    string AcademicYearName,
    int Capacity,
    int EnrollmentCount,
    bool IsPublished,
    string Phase);
