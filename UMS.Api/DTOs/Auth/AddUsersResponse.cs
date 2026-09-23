namespace UMS.Api.DTOs.Auth;

public class AddUsersResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<AddedUserResult> Added { get; set; } = [];
    public List<FailedUserResult> Failed { get; set; } = [];
}
