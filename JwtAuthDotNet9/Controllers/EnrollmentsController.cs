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
        [HttpPost]
        public async Task<ActionResult<Enrollment>> Enroll(int courseId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var userGuid))
                return Unauthorized();

            var course = await context.Courses.FindAsync(courseId);
            if (course == null) return NotFound("Course not found");

            var existingEnrollment = await context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userGuid);

            if (existingEnrollment != null)
                return BadRequest("Already enrolled in this course");

            var enrollment = new Enrollment
            {
                CourseId = courseId,
                UserId = userGuid
            };

            context.Enrollments.Add(enrollment);
            await context.SaveChangesAsync();
            return Ok(enrollment);
        }

        [HttpDelete("unenroll")]
        [Authorize(Roles = "Admin,Trainer")] // Restrict to privileged roles
        public async Task<IActionResult> Unenroll([FromQuery] Guid userId, [FromQuery] int courseId)
        {
            // 1. Find the specific enrollment
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
            // 1. Extract user ID from the JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var userGuid))
                return Unauthorized();

            // 2. Query enrollments and include course details
            var enrolledCourses = await context.Enrollments
                .Where(e => e.UserId == userGuid)
                .Include(e => e.Course) // Ensure Course is included
                .Select(e => new CourseDto
                {
                    Title = e.Course.Title,
                    Description = e.Course.Description,
                })
                .ToListAsync();

            return Ok(enrolledCourses);
        }
    }

}
