using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Unenroll(int id)
        {
            var enrollment = await context.Enrollments.FindAsync(id);
            if (enrollment == null) return NotFound();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (enrollment.UserId.ToString() != userId)
                return Forbid();

            context.Enrollments.Remove(enrollment);
            await context.SaveChangesAsync();
            return NoContent();
        }
        [HttpGet("my-courses")]
        public async Task<ActionResult<IEnumerable<Course>>> GetMyCourses()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var courses = await context.Enrollments
                .Where(e => e.UserId == userId)
                .Include(e => e.Course)
                .ThenInclude(c => c.Trainer)
                .Select(e => e.Course)
                .ToListAsync();

            return Ok(courses);
        }
        [HttpPost("admin-enroll")]
        [Authorize(Roles = "Admin,Trainer")]
        public async Task<IActionResult> AdminEnroll(Guid userId, int courseId)
        {
            var course = await context.Courses.FindAsync(courseId);
            if (course == null) return NotFound("Course not found");

            var existingEnrollment = await context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);

            if (existingEnrollment != null)
                return BadRequest("User already enrolled in this course");

            var enrollment = new Enrollment
            {
                CourseId = courseId,
                UserId = userId
            };

            context.Enrollments.Add(enrollment);
            await context.SaveChangesAsync();
            return Ok(enrollment);
        }

    }

}
