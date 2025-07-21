using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JwtAuthDotNet9.Entities
{
    public class CourseMaterial
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public string FilePath { get; set; }  // Stores the relative path to the file

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        [ForeignKey("Course")]
        public int CourseId { get; set; }

        [JsonIgnore]  // Prevents circular reference issues
        public Course Course { get; set; }
    }
}
