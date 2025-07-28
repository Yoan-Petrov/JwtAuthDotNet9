using System.ComponentModel.DataAnnotations;

namespace JwtAuthDotNet9.Models
{
    public class UserUpdateDto
    {
        [Required, StringLength(50)]
        public string FirstName { get; set; }

        [Required, StringLength(50)]
        public string LastName { get; set; }

        [EmailAddress]
        public string Email { get; set; }
    }
}