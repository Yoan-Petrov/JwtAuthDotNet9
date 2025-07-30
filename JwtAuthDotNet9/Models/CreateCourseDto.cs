using System.ComponentModel.DataAnnotations;

namespace JwtAuthDotNet9.Models
{
    // In Models/CreateCourseDto.cs
    public class CreateCourseDto
    {
        [Required]
        public string Title { get; set; }
        public string ShortDescription { get; set; } // New field
        public string Description { get; set; }
    }
}
