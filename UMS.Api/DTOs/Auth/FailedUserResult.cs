namespace UMS.Api.DTOs.Auth;

public class FailedUserResult
{
    public int Index { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
