namespace UMS.Api.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsVerified { get; set; }
    public string? VerificationCode { get; set; }
    public DateTime? VerificationCodeExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public StudentProfile? StudentProfile { get; set; }
    public StaffProfile? StaffProfile { get; set; }
    public ICollection<UserRole> UserRoles { get; set; } = [];
    public ICollection<Announcement> Announcements { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
}
