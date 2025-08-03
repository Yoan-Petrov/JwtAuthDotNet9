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
    public class CoursesController(UserDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses()
        {
            return await context.Courses
                .Where(c => c.Title != null) // Filter NULL records
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    ShortDescription = c.ShortDescription // Only return short desc for listings
                    // Trainer intentionally excluded
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CourseDto>> GetCourse(int id)
        {
            var course = await context.Courses
                .Where(c => c.Id == id)
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    ShortDescription = c.ShortDescription,
                    Description = c.Description
                })
                .FirstOrDefaultAsync();

            if (course == null)
            {
                return NotFound();
            }

            return course;
        }

        [HttpPost]
        [Authorize(Roles = "Trainer")]
        public async Task<ActionResult<CourseDto>> CreateCourse(CreateCourseDto createCourseDto)
        {
            var trainerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var course = new Course
            {
                Title = createCourseDto.Title,
                ShortDescription = createCourseDto.ShortDescription,
                Description = createCourseDto.Description,
                TrainerId = trainerId
            };

            context.Courses.Add(course);
            await context.SaveChangesAsync();

            // Return the full CourseDto with the generated ID
            return CreatedAtAction(nameof(GetCourse), new { id = course.Id },
                new CourseDto
                {
                    Id = course.Id,  // Now the client sees the correct DB-generated ID
                    Title = course.Title,
                    ShortDescription = course.ShortDescription,
                    Description = course.Description
                });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Trainer")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] CourseDto courseUpdateDto)
        {
            if (id != courseUpdateDto.Id)
            {
                return BadRequest("Route ID does not match course ID");
            }

            var course = await context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (course.TrainerId.ToString() != userId)
                return Forbid();

            // Update only the allowed fields
            course.Title = courseUpdateDto.Title;
            course.ShortDescription = courseUpdateDto.ShortDescription;
            course.Description = courseUpdateDto.Description;

            await context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Trainer")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (course.TrainerId.ToString() != userId)
                return Forbid();

            context.Courses.Remove(course);
            await context.SaveChangesAsync();
            return NoContent();
        }
        [HttpGet("trainer-courses")]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetCoursesByTrainer()
        {
            // Get trainer ID from JWT token
            var trainerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (trainerId == null || !Guid.TryParse(trainerId, out var trainerGuid))
                return Unauthorized();

            var courses = await context.Courses
                .Where(c => c.TrainerId == trainerGuid)
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    ShortDescription = c.ShortDescription,
                    //LessonCount = c.Lessons.Count // Assuming you have Lessons navigation property
                })
                .ToListAsync();

            return Ok(courses);
        }
    }
}