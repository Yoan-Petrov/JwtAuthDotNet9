using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting; 
using Microsoft.AspNetCore.Http;

namespace JwtAuthDotNet9.Controllers
{
    [ApiController]
    [Route("api/courses/{courseId}/materials")]
    [Authorize(Roles = "Trainer,Admin")]
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

