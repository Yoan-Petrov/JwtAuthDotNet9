using System.ComponentModel.DataAnnotations;

namespace JwtAuthDotNet9.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
        public List<Enrollment> Enrollments { get; set; } = new();

    }

}
