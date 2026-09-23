using System.Text;
using Microsoft.EntityFrameworkCore;
using UMS.Api.Models;

namespace UMS.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        var studentRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == AppRoles.Student);
        var doctorRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == AppRoles.Doctor);
        var taRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == AppRoles.TeachingAssistant);
        var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == AppRoles.Admin);
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("password");

        await EnsureDemoUserAsync(db, "Abdelrahman Mostafa", "abdelrahman@university.com", "+20 100 111 2201", passwordHash, studentRole,
            user => user.StudentProfile = UpdateStudentProfile(user.StudentProfile, 3.80m, false, "Campus Dorms", true));
        await EnsureDemoUserAsync(db, "Mariam Youssef", "mariam.youssef@university.com", "+20 100 111 2202", passwordHash, studentRole,
            user => user.StudentProfile = UpdateStudentProfile(user.StudentProfile, 3.45m, false, "Off Campus", false));
        await EnsureDemoUserAsync(db, "Omar Khaled", "omar.khaled@university.com", "+20 100 111 2203", passwordHash, studentRole,
            user => user.StudentProfile = UpdateStudentProfile(user.StudentProfile, 2.10m, true, "Campus Dorms", false));
        await EnsureDemoUserAsync(db, "Nour El-Din", "nour.eldin@university.com", "+20 100 111 2204", passwordHash, studentRole,
            user => user.StudentProfile = UpdateStudentProfile(user.StudentProfile, 3.05m, false, "Family Housing", false));

        await EnsureDemoUserAsync(db, "Dr. Ahmed Hassan", "ahmed.hassan@uni.com", "+20 100 222 3301", passwordHash, doctorRole,
            user => user.StaffProfile = UpdateStaffProfile(user.StaffProfile, "Computer Science", "Building A, Room 102", 18, 43, false));
        await EnsureDemoUserAsync(db, "Dr. Salma Nabil", "salma.nabil@uni.com", "+20 100 222 3302", passwordHash, doctorRole,
            user => user.StaffProfile = UpdateStaffProfile(user.StaffProfile, "Artificial Intelligence", "Building C, Room 211", 17, 36, true));
        await EnsureDemoUserAsync(db, "Fatima Ali", "fatimaali@university.com", "+20 100 222 3303", passwordHash, taRole,
            user => user.StaffProfile = UpdateStaffProfile(user.StaffProfile, "Software Engineering", "Building B, Lab 3", 16, 6, false));
        await EnsureDemoUserAsync(db, "Youssef Adel", "youssef.adel@university.com", "+20 100 222 3304", passwordHash, taRole,
            user => user.StaffProfile = UpdateStaffProfile(user.StaffProfile, "Database Systems", "Building D, Lab 1", 15, 4, true));

        await EnsureDemoUserAsync(db, "System Admin", "admin.one@university.com", "+20 100 333 4401", passwordHash, adminRole,
            user => user.StaffProfile = UpdateStaffProfile(user.StaffProfile, "System Administration", "Administration Building", 20, 0, false));

        await db.SaveChangesAsync();

        var courses = new[]
        {
            new CourseSeed("CS101", "Introduction to Computer Science", 3, 150),
            new CourseSeed("SE201", "Software Engineering Fundamentals", 4, 120),
            new CourseSeed("DB301", "Database Systems & Architecture", 3, 100),
            new CourseSeed("AI401", "Artificial Intelligence & Machine Learning", 3, 80),
            new CourseSeed("WEB220", "Web Application Development", 3, 90),
            new CourseSeed("NET330", "Computer Networks", 3, 85),
            new CourseSeed("SEC410", "Cybersecurity Principles", 3, 70),
            new CourseSeed("MOB250", "Mobile Application Development", 3, 75)
        };

        foreach (var course in courses)
        {
            await EnsureCourseAsync(db, course);
        }

        await db.SaveChangesAsync();

        var users = await db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.StaffProfile)
            .ToDictionaryAsync(u => u.Email);

        var courseMap = await db.Courses.ToDictionaryAsync(c => c.Code);

        var today = DateTime.UtcNow.Date;
        var yearStart = today.AddDays(-60);
        var academicYearName = $"{today.Year}-{today.Year + 1}";
        var academicYear = await db.AcademicYears.SingleOrDefaultAsync(item => item.Name == academicYearName);
        if (academicYear is null)
        {
            academicYear = new AcademicYear { Name = academicYearName, StartsAt = yearStart, EndsAt = yearStart.AddYears(1).AddDays(-1) };
            db.AcademicYears.Add(academicYear);
            await db.SaveChangesAsync();
        }
        academicYear.StartsAt = yearStart;
        academicYear.EndsAt = today.AddDays(365);

        var semester = await db.Semesters.SingleOrDefaultAsync(item => item.AcademicYearId == academicYear.Id && item.Name == "Demo Semester");
        if (semester is null)
        {
            semester = new Semester
            {
                AcademicYearId = academicYear.Id,
                Name = "Demo Semester",
                StartsAt = today.AddDays(-30),
                EndsAt = today.AddDays(150),
                RegistrationOpensAt = CampusInstant(today.AddDays(-45)),
                RegistrationClosesAt = CampusInstant(today.AddDays(15)),
                AddDropOpensAt = CampusInstant(today.AddDays(15)),
                AddDropClosesAt = CampusInstant(today.AddDays(25)),
                IsPublished = true
            };
            db.Semesters.Add(semester);
            await db.SaveChangesAsync();
        }
        semester.StartsAt = today.AddDays(-30);
        semester.EndsAt = today.AddDays(150);
        semester.RegistrationOpensAt = CampusInstant(today.AddDays(-45));
        semester.RegistrationClosesAt = CampusInstant(today.AddDays(15));
        semester.AddDropOpensAt = CampusInstant(today.AddDays(15));
        semester.AddDropClosesAt = CampusInstant(today.AddDays(25));
        semester.IsPublished = true;

        var upcomingSemester = await db.Semesters.SingleOrDefaultAsync(item => item.AcademicYearId == academicYear.Id && item.Name == "Upcoming Demo Semester");
        if (upcomingSemester is null)
        {
            upcomingSemester = new Semester { AcademicYearId = academicYear.Id, Name = "Upcoming Demo Semester" };
            db.Semesters.Add(upcomingSemester);
        }
        upcomingSemester.StartsAt = today.AddDays(200);
        upcomingSemester.EndsAt = today.AddDays(320);
        upcomingSemester.RegistrationOpensAt = CampusInstant(today.AddDays(150));
        upcomingSemester.RegistrationClosesAt = CampusInstant(today.AddDays(190));
        upcomingSemester.AddDropOpensAt = CampusInstant(today.AddDays(200));
        upcomingSemester.AddDropClosesAt = CampusInstant(today.AddDays(210));
        upcomingSemester.IsPublished = true;
        await db.SaveChangesAsync();

        var offeringMap = new Dictionary<string, CourseOffering>();
        foreach (var course in courseMap.Values)
        {
            var offering = await db.CourseOfferings.SingleOrDefaultAsync(item => item.CourseId == course.Id && item.SemesterId == semester.Id);
            if (offering is null)
            {
                offering = new CourseOffering { CourseId = course.Id, SemesterId = semester.Id, Capacity = course.MaxRegisteredStudents, IsPublished = true };
                db.CourseOfferings.Add(offering);
            }
            offeringMap[course.Code] = offering;

            var upcomingOffering = await db.CourseOfferings.SingleOrDefaultAsync(item => item.CourseId == course.Id && item.SemesterId == upcomingSemester.Id);
            if (upcomingOffering is null)
                db.CourseOfferings.Add(new CourseOffering { CourseId = course.Id, SemesterId = upcomingSemester.Id, Capacity = course.MaxRegisteredStudents, IsPublished = true });
        }
        await db.SaveChangesAsync();

        await EnsureStaffCourseAsync(db, users, offeringMap, "ahmed.hassan@uni.com", "CS101", "Lead Instructor");
        await EnsureStaffCourseAsync(db, users, offeringMap, "ahmed.hassan@uni.com", "SE201", "Lead Instructor");
        await EnsureStaffCourseAsync(db, users, offeringMap, "salma.nabil@uni.com", "AI401", "Lead Instructor");
        await EnsureStaffCourseAsync(db, users, offeringMap, "salma.nabil@uni.com", "SEC410", "Lead Instructor");
        await EnsureStaffCourseAsync(db, users, offeringMap, "fatimaali@university.com", "CS101", "Teaching Assistant");
        await EnsureStaffCourseAsync(db, users, offeringMap, "fatimaali@university.com", "SE201", "Teaching Assistant");
        await EnsureStaffCourseAsync(db, users, offeringMap, "fatimaali@university.com", "WEB220", "Lab Assistant");
        await EnsureStaffCourseAsync(db, users, offeringMap, "youssef.adel@university.com", "DB301", "Teaching Assistant");
        await EnsureStaffCourseAsync(db, users, offeringMap, "youssef.adel@university.com", "NET330", "Lab Assistant");
        await EnsureStaffCourseAsync(db, users, offeringMap, "ahmed.hassan@uni.com", "MOB250", "Course Coordinator");

        await EnsureEnrollmentAsync(db, users, offeringMap, "abdelrahman@university.com", "CS101", EnrollmentStatus.Accepted, 28, 19, 10, 38, "A");
        await EnsureEnrollmentAsync(db, users, offeringMap, "abdelrahman@university.com", "SE201", EnrollmentStatus.Accepted, 25, 18, 9, 35, "A-");
        await EnsureEnrollmentAsync(db, users, offeringMap, "abdelrahman@university.com", "DB301", EnrollmentStatus.Pending, null, null, null, null, null);
        await EnsureEnrollmentAsync(db, users, offeringMap, "mariam.youssef@university.com", "CS101", EnrollmentStatus.Accepted, 26, 18, 8, 36, "A-");
        await EnsureEnrollmentAsync(db, users, offeringMap, "mariam.youssef@university.com", "AI401", EnrollmentStatus.Accepted, 24, 17, 9, 34, "B+");
        await EnsureEnrollmentAsync(db, users, offeringMap, "mariam.youssef@university.com", "WEB220", EnrollmentStatus.Pending, null, null, null, null, null);
        await EnsureEnrollmentAsync(db, users, offeringMap, "omar.khaled@university.com", "CS101", EnrollmentStatus.Accepted, 18, 13, 6, 25, "C");
        await EnsureEnrollmentAsync(db, users, offeringMap, "omar.khaled@university.com", "NET330", EnrollmentStatus.Accepted, 20, 14, 7, 27, "C+");
        await EnsureEnrollmentAsync(db, users, offeringMap, "omar.khaled@university.com", "SEC410", EnrollmentStatus.Rejected, null, null, null, null, null);
        await EnsureEnrollmentAsync(db, users, offeringMap, "nour.eldin@university.com", "DB301", EnrollmentStatus.Accepted, 23, 17, 8, 33, "B+");
        await EnsureEnrollmentAsync(db, users, offeringMap, "nour.eldin@university.com", "WEB220", EnrollmentStatus.Accepted, 27, 18, 10, 37, "A");
        await EnsureEnrollmentAsync(db, users, offeringMap, "nour.eldin@university.com", "MOB250", EnrollmentStatus.Withdrawn, null, null, null, null, null);

        await db.SaveChangesAsync();

        await EnsureCourseContentAsync(db, offeringMap, "CS101", "cs101-syllabus.txt", "text/plain", "CS101 syllabus, grading policy, weekly topics, and office hour expectations.");
        await EnsureCourseContentAsync(db, offeringMap, "CS101", "cs101-lab-01.txt", "text/plain", "Lab 01: command line basics, algorithms as steps, and simple C# console exercises.");
        await EnsureCourseContentAsync(db, offeringMap, "SE201", "se201-project-brief.txt", "text/plain", "Semester project brief: requirements discovery, sprint planning, backlog grooming, and final demo.");
        await EnsureCourseContentAsync(db, offeringMap, "DB301", "db301-normalization-notes.txt", "text/plain", "Normalization notes covering 1NF, 2NF, 3NF, BCNF, and denormalization trade-offs.");
        await EnsureCourseContentAsync(db, offeringMap, "AI401", "ai401-reading-list.txt", "text/plain", "Reading list: search, regression, classification, model evaluation, and responsible AI.");
        await EnsureCourseContentAsync(db, offeringMap, "WEB220", "web220-nextjs-checklist.txt", "text/plain", "Checklist for routing, server actions, API integration, authentication, and deployment.");
        await EnsureCourseContentAsync(db, offeringMap, "NET330", "net330-lab-guide.txt", "text/plain", "Packet tracing lab guide covering TCP, DNS, HTTP, and subnetting exercises.");
        await EnsureCourseContentAsync(db, offeringMap, "SEC410", "sec410-threat-model-template.txt", "text/plain", "Threat model template with assets, actors, entry points, risks, and mitigations.");

        var quizMap = new Dictionary<string, Quiz>();

        await EnsureQuizAsync(db, offeringMap, quizMap, "CS101", "Quiz 1: Data Structures & Algorithms", "https://forms.google.com/demo-cs101-quiz1", 10, -5, 2, true);
        await EnsureQuizAsync(db, offeringMap, quizMap, "CS101", "Quiz 2: Complexity Basics", "https://forms.google.com/demo-cs101-quiz2", 10, -1, 6, true);
        await EnsureQuizAsync(db, offeringMap, quizMap, "SE201", "Quiz 1: Agile Methodologies & Design Patterns", "https://forms.google.com/demo-se201-quiz1", 10, -2, 5, true);
        await EnsureQuizAsync(db, offeringMap, quizMap, "DB301", "Quiz 1: SQL Joins", "https://forms.google.com/demo-db301-quiz1", 10, -4, 3, true);
        await EnsureQuizAsync(db, offeringMap, quizMap, "AI401", "Quiz 1: Model Evaluation", "https://forms.google.com/demo-ai401-quiz1", 15, -3, 4, true);
        await EnsureQuizAsync(db, offeringMap, quizMap, "WEB220", "Quiz 1: React & Next.js", "https://forms.google.com/demo-web220-quiz1", 10, 1, 8, true);
        await EnsureQuizAsync(db, offeringMap, quizMap, "NET330", "Quiz 1: Routing Fundamentals", "https://forms.google.com/demo-net330-quiz1", 10, -7, -1, false);
        await EnsureQuizAsync(db, offeringMap, quizMap, "SEC410", "Quiz 1: Security Foundations", "https://forms.google.com/demo-sec410-quiz1", 10, 2, 10, true);

        await db.SaveChangesAsync();

        await EnsureQuizGradeAsync(db, users, quizMap, "abdelrahman@university.com", "CS101:Quiz 1: Data Structures & Algorithms", 10);
        await EnsureQuizGradeAsync(db, users, quizMap, "abdelrahman@university.com", "CS101:Quiz 2: Complexity Basics", 9);
        await EnsureQuizGradeAsync(db, users, quizMap, "abdelrahman@university.com", "SE201:Quiz 1: Agile Methodologies & Design Patterns", 9);
        await EnsureQuizGradeAsync(db, users, quizMap, "mariam.youssef@university.com", "CS101:Quiz 1: Data Structures & Algorithms", 8);
        await EnsureQuizGradeAsync(db, users, quizMap, "mariam.youssef@university.com", "AI401:Quiz 1: Model Evaluation", 13);
        await EnsureQuizGradeAsync(db, users, quizMap, "omar.khaled@university.com", "CS101:Quiz 1: Data Structures & Algorithms", 6);
        await EnsureQuizGradeAsync(db, users, quizMap, "omar.khaled@university.com", "NET330:Quiz 1: Routing Fundamentals", 7);
        await EnsureQuizGradeAsync(db, users, quizMap, "nour.eldin@university.com", "DB301:Quiz 1: SQL Joins", 8);
        await EnsureQuizGradeAsync(db, users, quizMap, "nour.eldin@university.com", "WEB220:Quiz 1: React & Next.js", 10);

        await db.SaveChangesAsync();

        await EnsureAnnouncementAsync(db, users, offeringMap, "CS101", "ahmed.hassan@uni.com", "Welcome to CS101!", "Welcome all students. Please check the syllabus and submit Quiz 1 before the deadline.", ["Thank you Doctor, looking forward to the lectures!", "Will the first lab be graded?"]);
        await EnsureAnnouncementAsync(db, users, offeringMap, "SE201", "ahmed.hassan@uni.com", "Sprint 1 Teams Published", "Project teams and Sprint 1 deliverables are now available. Bring your backlog questions to section.", ["Can teams change after Sprint 1?", "We will prepare the backlog draft before class."]);
        await EnsureAnnouncementAsync(db, users, offeringMap, "DB301", "youssef.adel@university.com", "SQL Lab Reminder", "Please install SQL Server tools before the lab. The lab sheet is uploaded under course content.", ["Installed and tested successfully."]);
        await EnsureAnnouncementAsync(db, users, offeringMap, "AI401", "salma.nabil@uni.com", "Model Evaluation Workshop", "This week we will compare precision, recall, F1, and ROC-AUC using a sample dataset.", ["Can we use Python notebooks in the workshop?"]);
        await EnsureAnnouncementAsync(db, users, offeringMap, "WEB220", "fatimaali@university.com", "Next.js Demo Session", "The next lab will cover server actions, API calls, and deployment checks.", ["Please share the starter repository before lab."]);
        await EnsureAnnouncementAsync(db, users, offeringMap, "SEC410", "salma.nabil@uni.com", "Threat Modeling Exercise", "Groups should submit a one-page threat model for the sample registration system.", ["Should we include abuse cases too?"]);

        await EnsureQuestionnaireAsync(db, offeringMap, "CS101", ["How clear were the course learning objectives?", "Rate the instructor's responsiveness during office hours.", "What topic needs more examples?"]);
        await EnsureQuestionnaireAsync(db, offeringMap, "SE201", ["How useful are the sprint ceremonies?", "Is the project scope manageable?", "What tooling should we improve?"]);
        await EnsureQuestionnaireAsync(db, offeringMap, "DB301", ["How confident are you with joins?", "Was the normalization lecture clear?", "Which lab was hardest?"]);
        await EnsureQuestionnaireAsync(db, offeringMap, "AI401", ["How clear are the model evaluation metrics?", "Do you prefer notebook demos or slides?", "Which AI topic should receive more practice?"]);
        await EnsureQuestionnaireAsync(db, offeringMap, "WEB220", ["Was the Next.js routing material clear?", "How useful was the API integration lab?", "What frontend topic should be revisited?"]);

        await db.SaveChangesAsync();
    }

    private static async Task EnsureDemoUserAsync(ApplicationDbContext db, string fullName, string email, string phoneNumber, string passwordHash, Role? role, Action<User> configureProfile)
    {
        if (role is null)
        {
            return;
        }

        var user = await db.Users
            .Include(u => u.UserRoles)
            .Include(u => u.StudentProfile)
            .Include(u => u.StaffProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user is null)
        {
            user = new User { Email = email, CreatedAt = DateTime.UtcNow.AddDays(-30) };
            db.Users.Add(user);
        }

        user.FullName = fullName;
        user.PhoneNumber = phoneNumber;
        user.PasswordHash = passwordHash;
        user.IsVerified = true;
        user.UpdatedAt = DateTime.UtcNow;
        configureProfile(user);

        if (user.UserRoles.All(userRole => userRole.RoleId != role.Id))
        {
            user.UserRoles.Add(new UserRole { User = user, Role = role });
        }
    }

    private static StudentProfile UpdateStudentProfile(StudentProfile? profile, decimal gpa, bool academicWarning, string housingType, bool scholarshipStatus)
    {
        profile ??= new StudentProfile();
        profile.Gpa = gpa;
        profile.AcademicWarning = academicWarning;
        profile.HousingType = housingType;
        profile.ScholarshipStatus = scholarshipStatus;
        return profile;
    }

    private static StaffProfile UpdateStaffProfile(StaffProfile? profile, string specialization, string officeLocation, int rating, int researchPapers, bool remoteWork)
    {
        profile ??= new StaffProfile();
        profile.Specialization = specialization;
        profile.OfficeLocation = officeLocation;
        profile.OfficeHours = DateTime.UtcNow.Date.AddHours(10).AddMinutes(30);
        profile.ContactInfo = $"{specialization} department";
        profile.ProfileLink = $"https://university.example/staff/{specialization.ToLowerInvariant().Replace(" ", "-")}";
        profile.Rating = rating;
        profile.NumberOfResearchPapers = researchPapers;
        profile.RemoteWork = remoteWork;
        return profile;
    }

    private static async Task EnsureCourseAsync(ApplicationDbContext db, CourseSeed seed)
    {
        var course = await db.Courses.FirstOrDefaultAsync(c => c.Code == seed.Code);

        if (course is null)
        {
            db.Courses.Add(new Course { Code = seed.Code, Name = seed.Name, CreditHours = seed.CreditHours, MaxRegisteredStudents = seed.MaxRegisteredStudents });
            return;
        }

        course.Name = seed.Name;
        course.CreditHours = seed.CreditHours;
        course.MaxRegisteredStudents = seed.MaxRegisteredStudents;
    }

    private static DateTimeOffset CampusInstant(DateTime localDate)
    {
        TimeZoneInfo zone;
        try { zone = TimeZoneInfo.FindSystemTimeZoneById("Africa/Cairo"); }
        catch (TimeZoneNotFoundException) { zone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time"); }
        var local = DateTime.SpecifyKind(localDate, DateTimeKind.Unspecified);
        return new DateTimeOffset(TimeZoneInfo.ConvertTimeToUtc(local, zone));
    }

    private static async Task EnsureStaffCourseAsync(ApplicationDbContext db, IReadOnlyDictionary<string, User> users, IReadOnlyDictionary<string, CourseOffering> offerings, string staffEmail, string courseCode, string assignmentRole)
    {
        if (!users.TryGetValue(staffEmail, out var user) || user.StaffProfile is null || !offerings.TryGetValue(courseCode, out var offering))
        {
            return;
        }

        var staffCourse = await db.StaffCourses.FindAsync(user.StaffProfile.UserId, offering.Id);

        if (staffCourse is null)
        {
            db.StaffCourses.Add(new StaffCourse { StaffId = user.StaffProfile.UserId, CourseOfferingId = offering.Id, AssignmentRole = assignmentRole, AssignedAt = DateTime.UtcNow.AddDays(-20) });
            return;
        }

        staffCourse.AssignmentRole = assignmentRole;
    }

    private static async Task EnsureEnrollmentAsync(ApplicationDbContext db, IReadOnlyDictionary<string, User> users, IReadOnlyDictionary<string, CourseOffering> offerings, string studentEmail, string courseCode, EnrollmentStatus status, int? midtermGrade, int? classworkGrade, int? quizzesGrade, int? finalGrade, string? letterGrade)
    {
        if (!users.TryGetValue(studentEmail, out var user) || user.StudentProfile is null || !offerings.TryGetValue(courseCode, out var offering))
        {
            return;
        }

        var enrollment = await db.CourseEnrollments.FindAsync(offering.Id, user.StudentProfile.UserId);

        if (enrollment is null)
        {
            enrollment = new CourseEnrollment { CourseOfferingId = offering.Id, StudentId = user.StudentProfile.UserId, CreatedAt = DateTime.UtcNow.AddDays(-14) };
            db.CourseEnrollments.Add(enrollment);
        }

        enrollment.Status = status;
        enrollment.MidtermGrade = midtermGrade;
        enrollment.ClassworkGrade = classworkGrade;
        enrollment.QuizzesGrade = quizzesGrade;
        enrollment.FinalGrade = finalGrade;
        enrollment.LetterGrade = letterGrade;
        enrollment.UpdatedAt = DateTime.UtcNow;
    }

    private static async Task EnsureCourseContentAsync(ApplicationDbContext db, IReadOnlyDictionary<string, CourseOffering> offerings, string courseCode, string fileName, string contentType, string content)
    {
        if (!offerings.TryGetValue(courseCode, out var offering))
        {
            return;
        }

        var existing = await db.CourseContents.FirstOrDefaultAsync(c => c.CourseOfferingId == offering.Id && c.FileName == fileName);
        var bytes = Encoding.UTF8.GetBytes(content);

        if (existing is null)
        {
            db.CourseContents.Add(new CourseContent { CourseOfferingId = offering.Id, FileName = fileName, ContentType = contentType, FileSize = bytes.Length, FileData = bytes, UploadedAt = DateTime.UtcNow.AddDays(-10) });
            return;
        }

        existing.ContentType = contentType;
        existing.FileSize = bytes.Length;
        existing.FileData = bytes;
    }

    private static async Task EnsureQuizAsync(ApplicationDbContext db, IReadOnlyDictionary<string, CourseOffering> offerings, IDictionary<string, Quiz> quizMap, string courseCode, string title, string googleFormUrl, int maxGrade, int opensInDays, int closesInDays, bool isVisible)
    {
        if (!offerings.TryGetValue(courseCode, out var offering))
        {
            return;
        }

        var quiz = await db.Quizzes.FirstOrDefaultAsync(q => q.CourseOfferingId == offering.Id && q.Title == title);

        if (quiz is null)
        {
            quiz = new Quiz { CourseOfferingId = offering.Id, Title = title, CreatedAt = DateTime.UtcNow.AddDays(-12) };
            db.Quizzes.Add(quiz);
        }

        quiz.GoogleFormUrl = googleFormUrl;
        quiz.MaxGrade = maxGrade;
        quiz.OpensAt = DateTime.UtcNow.AddDays(opensInDays);
        quiz.ClosesAt = DateTime.UtcNow.AddDays(closesInDays);
        quiz.IsVisible = isVisible;
        quizMap[$"{courseCode}:{title}"] = quiz;
    }

    private static async Task EnsureQuizGradeAsync(ApplicationDbContext db, IReadOnlyDictionary<string, User> users, IReadOnlyDictionary<string, Quiz> quizzes, string studentEmail, string quizKey, int grade)
    {
        if (!users.TryGetValue(studentEmail, out var user) || user.StudentProfile is null || !quizzes.TryGetValue(quizKey, out var quiz))
        {
            return;
        }

        var quizGrade = await db.QuizGrades.FindAsync(quiz.Id, user.StudentProfile.UserId);

        if (quizGrade is null)
        {
            db.QuizGrades.Add(new QuizGrade { Quiz = quiz, StudentId = user.StudentProfile.UserId, Grade = grade, GradedAt = DateTime.UtcNow.AddDays(-2) });
            return;
        }

        quizGrade.Grade = grade;
        quizGrade.GradedAt = DateTime.UtcNow.AddDays(-2);
    }

    private static async Task EnsureAnnouncementAsync(ApplicationDbContext db, IReadOnlyDictionary<string, User> users, IReadOnlyDictionary<string, CourseOffering> offerings, string courseCode, string authorEmail, string title, string content, IReadOnlyList<string> comments)
    {
        if (!offerings.TryGetValue(courseCode, out var offering) || !users.TryGetValue(authorEmail, out var author))
        {
            return;
        }

        var announcement = await db.Announcements.FirstOrDefaultAsync(a => a.CourseOfferingId == offering.Id && a.Title == title);

        if (announcement is null)
        {
            announcement = new Announcement
            {
                CourseOfferingId = offering.Id,
                AuthorId = author.Id,
                Title = title,
                Content = content,
                CreatedAt = DateTime.UtcNow.AddDays(-7),
                UpdatedAt = DateTime.UtcNow
            };
            db.Announcements.Add(announcement);
            await db.SaveChangesAsync();
        }

        announcement.AuthorId = author.Id;
        announcement.Content = content;
        announcement.UpdatedAt = DateTime.UtcNow;

        var commentAuthors = users.Values.Where(u => u.StudentProfile is not null).ToList();
        for (var i = 0; i < comments.Count && i < commentAuthors.Count; i++)
        {
            var commentContent = comments[i];
            var commentAuthor = commentAuthors[i];
            var exists = await db.Comments.AnyAsync(c => c.AnnouncementId == announcement.Id && c.Content == commentContent);

            if (!exists)
            {
                db.Comments.Add(new Comment
                {
                    AnnouncementId = announcement.Id,
                    AuthorId = commentAuthor.Id,
                    Content = commentContent,
                    CreatedAt = DateTime.UtcNow.AddDays(-6 + i),
                    UpdatedAt = DateTime.UtcNow.AddDays(-6 + i)
                });
            }
        }
    }

    private static async Task EnsureQuestionnaireAsync(ApplicationDbContext db, IReadOnlyDictionary<string, CourseOffering> offerings, string courseCode, IReadOnlyList<string> questions)
    {
        if (!offerings.TryGetValue(courseCode, out var offering))
        {
            return;
        }

        var questionnaire = await db.Questionnaires
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.CourseOfferingId == offering.Id);

        if (questionnaire is null)
        {
            questionnaire = new Questionnaire { CourseOfferingId = offering.Id, CreatedAt = DateTime.UtcNow.AddDays(-3) };
            db.Questionnaires.Add(questionnaire);
        }

        foreach (var question in questions)
        {
            if (questionnaire.Questions.All(q => q.Text != question))
            {
                questionnaire.Questions.Add(new QuestionnaireQuestion { Text = question, IsRequired = true });
            }
        }
    }

    private sealed record CourseSeed(string Code, string Name, int CreditHours, int MaxRegisteredStudents);
}
