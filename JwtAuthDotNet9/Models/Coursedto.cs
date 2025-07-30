using System.ComponentModel.DataAnnotations;

namespace JwtAuthDotNet9.Models
{
    public class CourseDto
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        public string ShortDescription { get; set; } // New field
        public string Description { get; set; }

    }
}