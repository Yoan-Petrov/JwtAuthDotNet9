using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JwtAuthDotNet9.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EnrollmentsController(UserDbContext context) : ControllerBase
    {
        [HttpGet("course-enrollments")]
        public async Task<ActionResult<IEnumerable<EnrolledUserDto>>> GetCourseEnrollments([FromQuery] int courseId)
        {
            // Verify course exists
            if (!await context.Courses.AnyAsync(c => c.Id == courseId))
                return NotFound("Course not found");

            var enrollments = await context.Enrollments
                .Where(e => e.CourseId == courseId)
                .Include(e => e.User) // Include user details
                .Select(e => new EnrolledUserDto
                {
                    UserId = e.UserId.ToString(),
                    FullName = $"{e.User.FirstName} {e.User.LastName}",
                    Email = e.User.Email,
                    EnrollmentDate = e.EnrollmentDate
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        [HttpDelete("unenroll")]
        [Authorize(Roles = "Admin,Trainer")] // Restrict to privileged roles
        public async Task<IActionResult> Unenroll([FromQuery] Guid userId, [FromQuery] int courseId)
        {
            var enrollment = await context.Enrollments
                .Where(e => e.UserId == userId && e.CourseId == courseId)
                .FirstOrDefaultAsync();

            if (enrollment == null)
                return NotFound("Enrollment not found");

            // 2. Efficient deletion without loading full entity
            context.Enrollments.Remove(enrollment);
            await context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("admin-enroll")]
        [Authorize(Roles = "Admin,Trainer")]
        public async Task<IActionResult> AdminEnroll(Guid userId, int courseId)
        {
            // 1. Check if user and course exist
            if (!await context.Users.AnyAsync(u => u.Id == userId))
                return NotFound("User not found");

            if (!await context.Courses.AnyAsync(c => c.Id == courseId))
                return NotFound("Course not found");

            // 2. Check for existing enrollment
            if (await context.Enrollments.AnyAsync(e =>
                e.UserId == userId && e.CourseId == courseId))
                return BadRequest("Already enrolled");

            // 3. Create and save
            var enrollment = new Enrollment
            {
                UserId = userId,
                CourseId = courseId
                // EnrollmentDate auto-set
            };

            context.Enrollments.Add(enrollment);
            await context.SaveChangesAsync();

            // 4. Return just the essential data
            return Ok(new
            {
                enrollment.Id,
                enrollment.UserId,
                enrollment.CourseId,
                enrollment.EnrollmentDate
            });
        }
        [HttpGet("my-courses")]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetMyCourses()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var userGuid))
                return Unauthorized();

            var enrolledCourses = await context.Enrollments
                .Where(e => e.UserId == userGuid)
                .Include(e => e.Course)
                .Select(e => new CourseDto
                {
                    Id = e.Course.Id,
                    Title = e.Course.Title,
                    Description = e.Course.ShortDescription, // or ShortDescription
                                                             // Include other needed fields
                })
                .ToListAsync();

            return Ok(enrolledCourses);
        }
        // Updated DTO to handle GUID string
        public class EnrolledUserDto
        {
            public string UserId { get; set; }  // Stored as string
            public string FullName { get; set; }
            public string Email { get; set; }
            public DateTime EnrollmentDate { get; set; }
        }
    }

}
