using System.ComponentModel.DataAnnotations.Schema;

namespace JwtAuthDotNet9.Entities
{
    public class Enrollment
    {
        public int Id { get; set; }
        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;

        [ForeignKey("User")]
        public Guid UserId { get; set; }

        [ForeignKey("Course")]
        public int CourseId { get; set; }

        public User User { get; set; }
        public Course Course { get; set; }
    }
}
