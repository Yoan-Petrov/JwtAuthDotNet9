using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JwtAuthDotNet9.Controllers
{
    [ApiController]
    [Route("api/courses/{courseId}/materials")]
    [Authorize(Roles = "User,Trainer,Admin")]
    public class CourseMaterialsController : ControllerBase
    {
        private readonly UserDbContext _context;
        private readonly LocalFileService _fileService;
        private readonly IWebHostEnvironment _env; // Added

        public CourseMaterialsController(
            UserDbContext context,
            LocalFileService fileService,
            IWebHostEnvironment env) // Inject environment
        {
            _context = context;
            _fileService = fileService;
            _env = env; // Initialize
        }

        [HttpPost]
        public async Task<IActionResult> UploadMaterial(int courseId, IFormFile file)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return NotFound("Course not found");

            var filePath = await _fileService.SaveCourseMaterial(file, courseId);

            var material = new CourseMaterial
            {
                Title = Path.GetFileNameWithoutExtension(file.FileName),
                FilePath = filePath,
                CourseId = courseId
            };

            _context.CourseMaterials.Add(material);
            await _context.SaveChangesAsync();

            // Changed to return created material directly
            return Created($"/api/courses/{courseId}/materials/{material.Id}", material);
        }

        [HttpGet("{materialId}")]
        public async Task<IActionResult> DownloadMaterial(int courseId, int materialId)
        {
            var material = await _context.CourseMaterials
                .FirstOrDefaultAsync(m => m.Id == materialId && m.CourseId == courseId);

            if (material == null) return NotFound();

            // Use ContentRootPath if WebRootPath is null
            var rootPath = _env.WebRootPath ?? _env.ContentRootPath;
            var fullPath = Path.Combine(rootPath, material.FilePath);

            if (!System.IO.File.Exists(fullPath)) return NotFound("File not found");

            var contentType = _fileService.GetFileContentType(material.FilePath);
            return PhysicalFile(fullPath, contentType, material.Title + Path.GetExtension(fullPath));
        }
        [HttpDelete("{materialId}")]
        public async Task<IActionResult> DeleteMaterial(int courseId, int materialId)
        {
            // 1. Find the material
            var material = await _context.CourseMaterials
                .FirstOrDefaultAsync(m => m.Id == materialId && m.CourseId == courseId);

            if (material == null)
                return NotFound("Material not found");

            // 2. Verify course ownership (if needed)
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var course = await _context.Courses.FindAsync(courseId);

            if (course?.TrainerId.ToString() != userId && !User.IsInRole("Admin"))
                return Forbid();

            try
            {
                // 3. Delete physical file
                var rootPath = _env.WebRootPath ?? _env.ContentRootPath;
                var fullPath = Path.Combine(rootPath, material.FilePath);

                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);

                // 4. Remove database record
                _context.CourseMaterials.Remove(material);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                // Log the error (consider using ILogger)
                return StatusCode(500, "Failed to delete material: " + ex.Message);
            }
        }
        // Added this new endpoint for material metadata
        [HttpGet("{materialId}/metadata")]
        public async Task<ActionResult<CourseMaterial>> GetMaterial(int courseId, int materialId)
        {
            var material = await _context.CourseMaterials
                .FirstOrDefaultAsync(m => m.Id == materialId && m.CourseId == courseId);

            return material != null ? material : NotFound();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseMaterial>>> GetCourseMaterials(int courseId)
        {
            return await _context.CourseMaterials
                .Where(m => m.CourseId == courseId)
                .ToListAsync();
        }
    }
}

