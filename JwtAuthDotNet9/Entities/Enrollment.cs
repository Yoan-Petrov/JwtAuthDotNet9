using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace JwtAuthDotNet9.Entities
{
    public class Enrollment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;

        public Guid UserId { get; set; }

        public int CourseId { get; set; }
        [JsonIgnore]
        public User User { get; set; }
        [JsonIgnore]
        public Course Course { get; set; }
    }
}
