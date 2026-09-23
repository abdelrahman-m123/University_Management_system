using UMS.Api.DTOs.Courses;
using UMS.Api.Models;
using UMS.Api.Repositories.Common;
using UMS.Api.Repositories.CourseEnrollments;
using UMS.Api.Repositories.Courses;
using UMS.Api.Services.Common;

namespace UMS.Api.Services.Courses;

public class CourseService(
    ICourseRepository courses,
    ICourseEnrollmentRepository enrollments,
    IUnitOfWork unitOfWork) : ICourseService
{
    public async Task<List<CourseResponse>> GetAllAsync()
    {
        var courseList = await courses.GetAllAsync();
        return courseList.Select(ToResponse).ToList();
    }

    public async Task<ServiceResult<CourseResponse>> GetByIdAsync(int id)
    {
        var course = await courses.GetByIdAsync(id);

        if (course is null)
        {
            return ServiceResult<CourseResponse>.Failure(ResultStatus.NotFound, "Course not found");
        }

        return ServiceResult<CourseResponse>.Success(ToResponse(course), "Course retrieved successfully");
    }

    public async Task<ServiceResult<CourseResponse>> CreateAsync(CreateCourseRequest request)
    {
        var code = NormalizeCode(request.Code);
        var name = NormalizeName(request.Name);

        if (await courses.ExistsByCodeAsync(code))
        {
            return ServiceResult<CourseResponse>.Failure(ResultStatus.Conflict, "Course code already exists");
        }

        if (await courses.ExistsByNameAsync(name))
        {
            return ServiceResult<CourseResponse>.Failure(ResultStatus.Conflict, "Course name already exists");
        }

        var course = new Course
        {
            Code = code,
            Name = name,
            CreditHours = request.CreditHours,
            MaxRegisteredStudents = request.MaxRegisteredStudents
        };

        await courses.AddAsync(course);
        await unitOfWork.SaveChangesAsync();

        return ServiceResult<CourseResponse>.Success(ToResponse(course), "Course created successfully");
    }

    public async Task<ServiceResult<CourseResponse>> UpdateAsync(int id, UpdateCourseRequest request)
    {
        var course = await courses.GetByIdAsync(id);

        if (course is null)
        {
            return ServiceResult<CourseResponse>.Failure(ResultStatus.NotFound, "Course not found");
        }

        var code = NormalizeCode(request.Code);
        var name = NormalizeName(request.Name);

        if (await courses.ExistsByCodeForAnotherCourseAsync(code, id))
        {
            return ServiceResult<CourseResponse>.Failure(ResultStatus.Conflict, "Course code already exists");
        }

        if (await courses.ExistsByNameForAnotherCourseAsync(name, id))
        {
            return ServiceResult<CourseResponse>.Failure(ResultStatus.Conflict, "Course name already exists");
        }

        course.Code = code;
        course.Name = name;
        course.CreditHours = request.CreditHours;
        course.MaxRegisteredStudents = request.MaxRegisteredStudents;

        await unitOfWork.SaveChangesAsync();

        return ServiceResult<CourseResponse>.Success(ToResponse(course), "Course updated successfully");
    }

    public async Task<ServiceResult<object>> DeleteAsync(int id)
    {
        var course = await courses.GetByIdAsync(id);

        if (course is null)
        {
            return ServiceResult<object>.Failure(ResultStatus.NotFound, "Course not found");
        }

        if (await enrollments.HasEnrollmentsForCourseAsync(id))
        {
            return ServiceResult<object>.Failure(ResultStatus.Conflict, "Course cannot be deleted while students are enrolled");
        }

        courses.Remove(course);
        await unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Success(new object(), "Course deleted successfully");
    }

    private static CourseResponse ToResponse(Course course)
    {
        return new CourseResponse
        {
            Id = course.Id,
            Code = course.Code,
            Name = course.Name,
            CreditHours = course.CreditHours,
            MaxRegisteredStudents = course.MaxRegisteredStudents
        };
    }

    private static string NormalizeCode(string code)
    {
        return code.Trim().ToUpperInvariant();
    }

    private static string NormalizeName(string name)
    {
        return name.Trim();
    }
}
