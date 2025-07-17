using System.ComponentModel.DataAnnotations;

namespace JwtAuthDotNet9.Models
{
    public class UserDto
    {
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }
}
