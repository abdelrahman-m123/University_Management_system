using Microsoft.EntityFrameworkCore;
using UMS.Api.Models;

namespace UMS.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<StaffProfile> StaffProfiles => Set<StaffProfile>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<Semester> Semesters => Set<Semester>();
    public DbSet<CourseOffering> CourseOfferings => Set<CourseOffering>();
    public DbSet<CourseEnrollment> CourseEnrollments => Set<CourseEnrollment>();
    public DbSet<CourseContent> CourseContents => Set<CourseContent>();
    public DbSet<StaffCourse> StaffCourses => Set<StaffCourse>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizGrade> QuizGrades => Set<QuizGrade>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Questionnaire> Questionnaires => Set<Questionnaire>();
    public DbSet<QuestionnaireQuestion> QuestionnaireQuestions => Set<QuestionnaireQuestion>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.Email).HasMaxLength(255);
            entity.Property(user => user.FullName).HasMaxLength(150);
            entity.Property(user => user.PasswordHash).HasMaxLength(255);
            entity.Property(user => user.PhoneNumber).HasMaxLength(25);
            entity.Property(user => user.VerificationCode).HasMaxLength(20);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(role => role.Name).IsUnique();
            entity.Property(role => role.Name).HasMaxLength(50);
            entity.HasData(
                new Role { Id = 1, Name = AppRoles.Student },
                new Role { Id = 2, Name = AppRoles.TeachingAssistant },
                new Role { Id = 3, Name = AppRoles.Doctor },
                new Role { Id = 4, Name = AppRoles.Admin },
                new Role { Id = 5, Name = AppRoles.SuperAdmin });
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(userRole => new { userRole.UserId, userRole.RoleId });
            entity
                .HasOne(userRole => userRole.User)
                .WithMany(user => user.UserRoles)
                .HasForeignKey(userRole => userRole.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity
                .HasOne(userRole => userRole.Role)
                .WithMany(role => role.UserRoles)
                .HasForeignKey(userRole => userRole.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StudentProfile>(entity =>
        {
            entity.HasKey(profile => profile.UserId);
            entity.Property(profile => profile.Gpa).HasPrecision(3, 2);
            entity.Property(profile => profile.HousingType).HasMaxLength(50);
            entity
                .HasOne(profile => profile.User)
                .WithOne(user => user.StudentProfile)
                .HasForeignKey<StudentProfile>(profile => profile.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StaffProfile>(entity =>
        {
            entity.HasKey(profile => profile.UserId);
            entity.Property(profile => profile.ContactInfo).HasMaxLength(255);
            entity.Property(profile => profile.ProfileLink).HasMaxLength(500);
            entity.Property(profile => profile.OfficeLocation).HasMaxLength(100);
            entity.Property(profile => profile.Specialization).HasMaxLength(100);
            entity
                .HasOne(profile => profile.User)
                .WithOne(user => user.StaffProfile)
                .HasForeignKey<StaffProfile>(profile => profile.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasIndex(course => course.Code).IsUnique();
            entity.HasIndex(course => course.Name).IsUnique();
            entity.Property(course => course.Code).HasMaxLength(30);
            entity.Property(course => course.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<AcademicYear>(entity =>
        {
            entity.HasIndex(year => year.Name).IsUnique();
            entity.Property(year => year.Name).HasMaxLength(30);
        });

        modelBuilder.Entity<Semester>(entity =>
        {
            entity.Property(semester => semester.Name).HasMaxLength(50);
            entity.HasOne(semester => semester.AcademicYear)
                .WithMany(year => year.Semesters)
                .HasForeignKey(semester => semester.AcademicYearId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CourseOffering>(entity =>
        {
            entity.HasIndex(offering => new { offering.CourseId, offering.SemesterId }).IsUnique();
            entity.HasOne(offering => offering.Course)
                .WithMany(course => course.Offerings)
                .HasForeignKey(offering => offering.CourseId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(offering => offering.Semester)
                .WithMany(semester => semester.Offerings)
                .HasForeignKey(offering => offering.SemesterId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CourseEnrollment>(entity =>
        {
            entity.HasKey(enrollment => new { enrollment.CourseOfferingId, enrollment.StudentId });
            entity.Property(enrollment => enrollment.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(enrollment => enrollment.LetterGrade).HasMaxLength(2);
            entity.HasIndex(enrollment => enrollment.StudentId);
            entity.HasIndex(enrollment => new { enrollment.CourseOfferingId, enrollment.Status, enrollment.WaitlistSequence });
            entity
                .HasOne(enrollment => enrollment.CourseOffering)
                .WithMany(offering => offering.Enrollments)
                .HasForeignKey(enrollment => enrollment.CourseOfferingId)
                .OnDelete(DeleteBehavior.Restrict);
            entity
                .HasOne(enrollment => enrollment.Student)
                .WithMany(student => student.Enrollments)
                .HasForeignKey(enrollment => enrollment.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OutboxMessage>(entity =>
        {
            entity.HasKey(message => message.Id);
            entity.Property(message => message.Type).HasMaxLength(100);
            entity.HasIndex(message => new { message.ProcessedAt, message.CreatedAt });
        });

        modelBuilder.Entity<CourseContent>(entity =>
        {
            entity.Property(content => content.FileName).HasMaxLength(255);
            entity.Property(content => content.ContentType).HasMaxLength(100);
            entity.Property(content => content.FileData).HasColumnType("varbinary(max)");
            entity
                .HasOne(content => content.CourseOffering)
                .WithMany(offering => offering.Contents)
                .HasForeignKey(content => content.CourseOfferingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StaffCourse>(entity =>
        {
            entity.HasKey(staffCourse => new { staffCourse.StaffId, staffCourse.CourseOfferingId });
            entity.Property(staffCourse => staffCourse.AssignmentRole).HasMaxLength(50);
            entity
                .HasOne(staffCourse => staffCourse.Staff)
                .WithMany(staff => staff.StaffCourses)
                .HasForeignKey(staffCourse => staffCourse.StaffId)
                .OnDelete(DeleteBehavior.Restrict);
            entity
                .HasOne(staffCourse => staffCourse.CourseOffering)
                .WithMany(offering => offering.StaffCourses)
                .HasForeignKey(staffCourse => staffCourse.CourseOfferingId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.Property(quiz => quiz.Title).HasMaxLength(100);
            entity.Property(quiz => quiz.GoogleFormUrl).HasMaxLength(500);
            entity
                .HasOne(quiz => quiz.CourseOffering)
                .WithMany(offering => offering.Quizzes)
                .HasForeignKey(quiz => quiz.CourseOfferingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuizGrade>(entity =>
        {
            entity.HasKey(grade => new { grade.QuizId, grade.StudentId });
            entity
                .HasOne(grade => grade.Quiz)
                .WithMany(quiz => quiz.Grades)
                .HasForeignKey(grade => grade.QuizId)
                .OnDelete(DeleteBehavior.Cascade);
            entity
                .HasOne(grade => grade.Student)
                .WithMany(student => student.QuizGrades)
                .HasForeignKey(grade => grade.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.Property(announcement => announcement.Title).HasMaxLength(100);
            entity.Property(announcement => announcement.Content).HasMaxLength(1000);
            entity
                .HasOne(announcement => announcement.CourseOffering)
                .WithMany(offering => offering.Announcements)
                .HasForeignKey(announcement => announcement.CourseOfferingId)
                .OnDelete(DeleteBehavior.Cascade);
            entity
                .HasOne(announcement => announcement.Author)
                .WithMany(user => user.Announcements)
                .HasForeignKey(announcement => announcement.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Questionnaire>(entity =>
        {
            entity.HasOne(questionnaire => questionnaire.CourseOffering)
                .WithMany(offering => offering.Questionnaires)
                .HasForeignKey(questionnaire => questionnaire.CourseOfferingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.Property(comment => comment.Content).HasMaxLength(1000);
            entity
                .HasOne(comment => comment.Announcement)
                .WithMany(announcement => announcement.Comments)
                .HasForeignKey(comment => comment.AnnouncementId)
                .OnDelete(DeleteBehavior.Cascade);
            entity
                .HasOne(comment => comment.Author)
                .WithMany(user => user.Comments)
                .HasForeignKey(comment => comment.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<QuestionnaireQuestion>(entity =>
        {
            entity.Property(question => question.Text).HasMaxLength(1000);
        });
    }
}
