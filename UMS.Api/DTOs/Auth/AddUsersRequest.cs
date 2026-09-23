using System.ComponentModel.DataAnnotations;

namespace UMS.Api.DTOs.Auth;

public class AddUsersRequest
{
    [Required]
    [MinLength(1)]
    public List<CreateUserRequest> Users { get; set; } = [];
}
