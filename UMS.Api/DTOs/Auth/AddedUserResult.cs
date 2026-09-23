namespace UMS.Api.DTOs.Auth;

public class AddedUserResult
{
    public int Index { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
