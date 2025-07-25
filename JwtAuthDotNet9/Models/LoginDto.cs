using System.ComponentModel.DataAnnotations;

namespace JwtAuthDotNet9.Models
{
    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

    }
}
