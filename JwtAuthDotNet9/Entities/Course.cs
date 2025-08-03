using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace JwtAuthDotNet9.Entities
{
    public class Course
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }
        public string ShortDescription { get; set; }
        public string Description { get; set; }

        [ForeignKey("Trainer")]
        public Guid TrainerId { get; set; }

        public User Trainer { get; set; }
        [JsonIgnore]
        public List<Enrollment> Enrollments { get; set; } = new();
        public List<CourseMaterial> Materials { get; set; } = new List<CourseMaterial>();

    }
}
