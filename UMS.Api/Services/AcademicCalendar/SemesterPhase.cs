using UMS.Api.Models;

namespace UMS.Api.Services.AcademicCalendar;

public static class SemesterPhase
{
    private static readonly TimeZoneInfo CampusTimeZone = FindCampusTimeZone();

    public static string Get(Semester semester, DateTimeOffset now)
    {
        if (!semester.IsPublished)
        {
            return "Unpublished";
        }

        if (now < semester.RegistrationOpensAt)
        {
            return "Upcoming";
        }

        if (now >= semester.RegistrationOpensAt && now < semester.RegistrationClosesAt)
        {
            return "Registration Open";
        }

        if (now >= semester.AddDropOpensAt && now < semester.AddDropClosesAt)
        {
            return "Add/Drop Open";
        }

        if (now >= AtCampusTime(semester.EndsAt.Date.AddDays(1)))
        {
            return "Completed";
        }

        return now < AtCampusTime(semester.StartsAt.Date)
            ? "Registration Closed"
            : "Changes Closed";
    }

    public static bool IsRegistrationOpen(Semester semester, DateTimeOffset now) =>
        semester.IsPublished && now >= semester.RegistrationOpensAt && now < semester.RegistrationClosesAt;

    public static bool IsAddDropOpen(Semester semester, DateTimeOffset now) =>
        semester.IsPublished && now >= semester.AddDropOpensAt && now < semester.AddDropClosesAt;

    public static DateTime CampusDate(DateTimeOffset instant) => TimeZoneInfo.ConvertTime(instant, CampusTimeZone).Date;

    private static DateTimeOffset AtCampusTime(DateTime localDateTime) =>
        new(TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(localDateTime, DateTimeKind.Unspecified), CampusTimeZone));

    private static TimeZoneInfo FindCampusTimeZone()
    {
        try { return TimeZoneInfo.FindSystemTimeZoneById("Africa/Cairo"); }
        catch (TimeZoneNotFoundException) { return TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time"); }
    }
}
