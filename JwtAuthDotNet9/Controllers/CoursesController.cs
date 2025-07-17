using JwtAuthDotNet9.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using JwtAuthDotNet9.Models;
using JwtAuthDotNet9.Data;
using Microsoft.EntityFrameworkCore;

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
        public async Task<ActionResult<Course>> CreateCourse(CourseDto courseDto)
        {
            var trainerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var course = new Course
            {
                Title = courseDto.Title,
                Description = courseDto.Description,
                TrainerId = trainerId
            };

            context.Courses.Add(course);
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Trainer")]
        public async Task<IActionResult> UpdateCourse(int id, CourseDto courseDto)
        {
            var course = await context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (course.TrainerId.ToString() != userId)
                return Forbid();

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

    public class CourseDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
    }
}