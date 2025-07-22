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
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
        {
            return await context.Courses.Include(c => c.Trainer).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> GetCourse(int id)
        {
            var course = await context.Courses.FindAsync(id);
            return course ?? (ActionResult<Course>)NotFound();
        }

        [HttpPost]
        [Authorize(Roles = "Trainer")]
        public async Task<ActionResult<CourseDto>> CreateCourse(CreateCourseDto createCourseDto)
        {
            var trainerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var course = new Course
            {
                Title = createCourseDto.Title,
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
                    Description = course.Description
                });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Trainer")]
        public async Task<IActionResult> UpdateCourse(int id, CourseDto courseDto)
        {
            if (id != courseDto.Id)
            {
                return BadRequest("Route ID does not match course ID");
            }

            var course = await context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (course.TrainerId.ToString() != userId)
                return Forbid();

            course.Id = courseDto.Id;
            course.Title = courseDto.Title;
            course.Description = courseDto.Description;

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
    }
}