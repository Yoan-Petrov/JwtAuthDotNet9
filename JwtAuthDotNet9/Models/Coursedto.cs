using System.ComponentModel.DataAnnotations;

namespace JwtAuthDotNet9.Models
{
    public class CourseDto
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }
    }
}
