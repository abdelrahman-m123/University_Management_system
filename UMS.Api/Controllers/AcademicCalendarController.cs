using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.DTOs.AcademicCalendar;
using UMS.Api.Models;
using UMS.Api.Services.AcademicCalendar;

namespace UMS.Api.Controllers;

[ApiController]
[Authorize]
public class AcademicCalendarController(ApplicationDbContext db) : ControllerBase
{
    private bool IsAdmin => User.IsInRole(AppRoles.Admin) || User.IsInRole(AppRoles.SuperAdmin);

    [HttpGet("api/academic-years")]
    public async Task<ActionResult<List<AcademicYearResponse>>> GetAcademicYears()
    {
        var years = await db.AcademicYears.OrderByDescending(year => year.StartsAt)
            .Select(year => new AcademicYearResponse(year.Id, year.Name, year.StartsAt, year.EndsAt))
            .ToListAsync();
        return Ok(years);
    }

    [HttpPost("api/academic-years")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<AcademicYearResponse>> CreateAcademicYear(AcademicYearRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || !ValidRange(request.StartsAt, request.EndsAt))
        {
            return BadRequest(new { message = "Provide an academic year name and an end date after its start." });
        }
        if (await db.AcademicYears.AnyAsync(item => item.Name == request.Name.Trim()))
            return Conflict(new { message = "An academic year with this name already exists." });

        var year = new AcademicYear
        {
            Name = request.Name.Trim(),
            StartsAt = request.StartsAt.Date,
            EndsAt = request.EndsAt.Date
        };
        db.AcademicYears.Add(year);
        await db.SaveChangesAsync();
        return Created($"/api/academic-years/{year.Id}", new AcademicYearResponse(year.Id, year.Name, year.StartsAt, year.EndsAt));
    }

    [HttpPut("api/academic-years/{academicYearId:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<AcademicYearResponse>> UpdateAcademicYear(int academicYearId, AcademicYearRequest request)
    {
        var year = await db.AcademicYears.Include(item => item.Semesters).SingleOrDefaultAsync(item => item.Id == academicYearId);
        if (year is null) return NotFound(new { message = "Academic year not found." });
        if (string.IsNullOrWhiteSpace(request.Name) || !ValidRange(request.StartsAt, request.EndsAt)) return BadRequest(new { message = "Provide an academic year name and an end date after its start." });
        if (year.Semesters.Any(semester => semester.StartsAt.Date < request.StartsAt.Date || semester.EndsAt.Date > request.EndsAt.Date))
            return BadRequest(new { message = "Academic year dates must contain all existing semesters." });
        if (await db.AcademicYears.AnyAsync(item => item.Id != year.Id && item.Name == request.Name.Trim()))
            return Conflict(new { message = "An academic year with this name already exists." });
        year.Name = request.Name.Trim();
        year.StartsAt = request.StartsAt.Date;
        year.EndsAt = request.EndsAt.Date;
        await db.SaveChangesAsync();
        return Ok(new AcademicYearResponse(year.Id, year.Name, year.StartsAt, year.EndsAt));
    }

    [HttpGet("api/semesters")]
    public async Task<ActionResult<List<SemesterResponse>>> GetSemesters()
    {
        var query = db.Semesters.Include(semester => semester.AcademicYear).AsQueryable();
        if (!IsAdmin)
        {
            query = query.Where(semester => semester.IsPublished);
        }

        var semesters = await query.OrderByDescending(semester => semester.StartsAt).ToListAsync();
        return Ok(semesters.Select(ToResponse));
    }

    [HttpPost("api/academic-years/{academicYearId:int}/semesters")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<SemesterResponse>> CreateSemester(int academicYearId, SemesterRequest request)
    {
        var year = await db.AcademicYears.FindAsync(academicYearId);
        if (year is null)
        {
            return NotFound(new { message = "Academic year not found." });
        }

        var validation = ValidateSemester(year, request);
        if (validation is not null)
        {
            return BadRequest(new { message = validation });
        }

        var semester = new Semester
        {
            AcademicYearId = academicYearId,
            Name = request.Name.Trim(),
            StartsAt = request.StartsAt.Date,
            EndsAt = request.EndsAt.Date,
            RegistrationOpensAt = request.RegistrationOpensAt,
            RegistrationClosesAt = request.RegistrationClosesAt,
            AddDropOpensAt = request.AddDropOpensAt,
            AddDropClosesAt = request.AddDropClosesAt,
            IsPublished = request.IsPublished
        };
        db.Semesters.Add(semester);
        await db.SaveChangesAsync();
        await db.Entry(semester).Reference(item => item.AcademicYear).LoadAsync();
        return Created($"/api/semesters/{semester.Id}", ToResponse(semester));
    }

    [HttpPut("api/semesters/{semesterId:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<SemesterResponse>> UpdateSemester(int semesterId, SemesterRequest request)
    {
        var semester = await db.Semesters.Include(item => item.AcademicYear)
            .SingleOrDefaultAsync(item => item.Id == semesterId);
        if (semester is null)
        {
            return NotFound(new { message = "Semester not found." });
        }

        var validation = ValidateSemester(semester.AcademicYear, request);
        if (validation is not null)
        {
            return BadRequest(new { message = validation });
        }

        semester.Name = request.Name.Trim();
        semester.StartsAt = request.StartsAt.Date;
        semester.EndsAt = request.EndsAt.Date;
        semester.RegistrationOpensAt = request.RegistrationOpensAt;
        semester.RegistrationClosesAt = request.RegistrationClosesAt;
        semester.AddDropOpensAt = request.AddDropOpensAt;
        semester.AddDropClosesAt = request.AddDropClosesAt;
        semester.IsPublished = request.IsPublished;
        await db.SaveChangesAsync();
        return Ok(ToResponse(semester));
    }

    [HttpGet("api/semesters/{semesterId:int}/offerings")]
    public async Task<ActionResult<List<CourseOfferingResponse>>> GetOfferings(int semesterId)
    {
        var query = db.CourseOfferings
            .Include(offering => offering.Course)
            .Include(offering => offering.Semester)
            .ThenInclude(semester => semester.AcademicYear)
            .Include(offering => offering.Enrollments)
            .Where(offering => offering.SemesterId == semesterId);

        if (!IsAdmin)
        {
            query = query.Where(offering => offering.IsPublished && offering.Semester.IsPublished);
        }

        var offerings = await query.OrderBy(offering => offering.Course.Code).ToListAsync();
        return Ok(offerings.Select(ToOfferingResponse));
    }

    [HttpGet("api/offerings")]
    public async Task<ActionResult<List<CourseOfferingResponse>>> GetAllOfferings([FromQuery] int? semesterId)
    {
        var query = db.CourseOfferings
            .Include(offering => offering.Course)
            .Include(offering => offering.Semester).ThenInclude(semester => semester.AcademicYear)
            .Include(offering => offering.Enrollments)
            .AsQueryable();
        if (semesterId.HasValue) query = query.Where(offering => offering.SemesterId == semesterId.Value);
        if (!IsAdmin) query = query.Where(offering => offering.IsPublished && offering.Semester.IsPublished);
        var offerings = await query.OrderByDescending(offering => offering.Semester.StartsAt)
            .ThenBy(offering => offering.Course.Code).ToListAsync();
        return Ok(offerings.Select(ToOfferingResponse));
    }

    [HttpGet("api/offerings/{offeringId:int}")]
    public async Task<ActionResult<CourseOfferingResponse>> GetOffering(int offeringId)
    {
        var offering = await db.CourseOfferings
            .Include(item => item.Course)
            .Include(item => item.Semester).ThenInclude(semester => semester.AcademicYear)
            .Include(item => item.Enrollments)
            .SingleOrDefaultAsync(item => item.Id == offeringId && (IsAdmin || item.IsPublished && item.Semester.IsPublished));
        return offering is null ? NotFound() : Ok(ToOfferingResponse(offering));
    }

    [HttpPost("api/offerings")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<CourseOfferingResponse>> CreateOffering(CourseOfferingRequest request)
    {
        var course = await db.Courses.FindAsync(request.CourseId);
        var semester = await db.Semesters.Include(item => item.AcademicYear)
            .SingleOrDefaultAsync(item => item.Id == request.SemesterId);
        if (course is null || semester is null)
        {
            return NotFound(new { message = "Course or semester not found." });
        }

        if (await db.CourseOfferings.AnyAsync(item => item.CourseId == request.CourseId && item.SemesterId == request.SemesterId))
        {
            return Conflict(new { message = "This course already has an offering in this semester." });
        }

        var offering = new CourseOffering
        {
            CourseId = course.Id,
            SemesterId = semester.Id,
            Capacity = request.Capacity ?? course.MaxRegisteredStudents,
            IsPublished = request.IsPublished
        };
        db.CourseOfferings.Add(offering);
        await db.SaveChangesAsync();
        offering.Course = course;
        offering.Semester = semester;
        return Created($"/api/offerings/{offering.Id}", ToOfferingResponse(offering));
    }

    [HttpPut("api/offerings/{offeringId:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.SuperAdmin}")]
    public async Task<ActionResult<CourseOfferingResponse>> UpdateOffering(int offeringId, UpdateCourseOfferingRequest request)
    {
        var offering = await db.CourseOfferings
            .Include(item => item.Course)
            .Include(item => item.Semester).ThenInclude(semester => semester.AcademicYear)
            .Include(item => item.Enrollments)
            .SingleOrDefaultAsync(item => item.Id == offeringId);
        if (offering is null) return NotFound(new { message = "Course offering not found." });
        var occupied = offering.Enrollments.Count(item => item.Status is EnrollmentStatus.Pending or EnrollmentStatus.Accepted or EnrollmentStatus.WithdrawalRequested);
        if (request.Capacity < occupied) return BadRequest(new { message = "Capacity cannot be lower than current pending or accepted enrollment." });
        offering.Capacity = request.Capacity;
        offering.IsPublished = request.IsPublished;
        db.OutboxMessages.Add(new OutboxMessage { Type = "EnrollmentUpdated", CourseOfferingId = offeringId, Revision = DateTime.UtcNow.Ticks });
        await db.SaveChangesAsync();
        return Ok(ToOfferingResponse(offering));
    }

    private static SemesterResponse ToResponse(Semester semester) => new(
        semester.Id,
        semester.AcademicYearId,
        semester.AcademicYear.Name,
        semester.Name,
        semester.StartsAt,
        semester.EndsAt,
        semester.RegistrationOpensAt,
        semester.RegistrationClosesAt,
        semester.AddDropOpensAt,
        semester.AddDropClosesAt,
        semester.IsPublished,
        SemesterPhase.Get(semester, DateTimeOffset.UtcNow));

    private static CourseOfferingResponse ToOfferingResponse(CourseOffering offering) => new(
        offering.Id,
        offering.CourseId,
        offering.Course.Code,
        offering.Course.Name,
        offering.Course.CreditHours,
        offering.SemesterId,
        offering.Semester.Name,
        offering.Semester.AcademicYear.Name,
        offering.Capacity,
        offering.Enrollments.Count(enrollment => enrollment.Status is EnrollmentStatus.Pending or EnrollmentStatus.Accepted or EnrollmentStatus.WithdrawalRequested),
        offering.IsPublished,
        SemesterPhase.Get(offering.Semester, DateTimeOffset.UtcNow));

    private static bool ValidRange(DateTime start, DateTime end) => end.Date > start.Date;

    private static string? ValidateSemester(AcademicYear year, SemesterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.EndsAt.Date <= request.StartsAt.Date || request.StartsAt.Date < year.StartsAt.Date || request.EndsAt.Date > year.EndsAt.Date)
        {
            return "Semester dates must fall within the academic year and end after they start.";
        }
        if (request.RegistrationClosesAt <= request.RegistrationOpensAt)
        {
            return "Registration close must be after registration open.";
        }
        if (request.AddDropClosesAt <= request.AddDropOpensAt)
        {
            return "Add/drop close must be after add/drop open.";
        }
        if (request.RegistrationClosesAt > request.AddDropOpensAt)
        {
            return "Registration must close before the add/drop window opens.";
        }
        var addDropStart = SemesterPhase.CampusDate(request.AddDropOpensAt);
        var addDropEnd = SemesterPhase.CampusDate(request.AddDropClosesAt);
        if (addDropStart < request.StartsAt.Date || addDropEnd > request.EndsAt.Date)
        {
            return "The add/drop window must fall within the semester dates.";
        }
        if (SemesterPhase.CampusDate(request.RegistrationClosesAt) > request.EndsAt.Date)
        {
            return "Registration must close no later than the final semester day.";
        }
        return null;
    }
}
