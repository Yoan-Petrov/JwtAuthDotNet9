namespace JwtAuthDotNet9.Models
{
    public class EnrollmentDto
    {
        public int EnrollmentId { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public CourseDto Course { get; set; }
    }
}
