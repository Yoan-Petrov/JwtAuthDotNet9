using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JwtAuthDotNet9.Entities
{
    public class Course
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        // Trainer is just a User with Trainer role
        // We track this separately from enrollments
        [ForeignKey("Trainer")]
        public Guid TrainerId { get; set; }

        public User Trainer { get; set; }
        [JsonIgnore]
        public List<Enrollment> Enrollments { get; set; } = new();
    }
}
