namespace JwtAuthDotNet9.Services
{
    public class LocalFileService
    {
        private readonly IWebHostEnvironment _env;
        private const string BaseUploadPath = "uploads/course-materials";

        public LocalFileService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> SaveCourseMaterial(IFormFile file, int courseId)
        {
            // Use ContentRootPath if WebRootPath is null
            var rootPath = _env.WebRootPath ?? _env.ContentRootPath;

            var courseDirectory = Path.Combine(rootPath, BaseUploadPath, courseId.ToString());
            Directory.CreateDirectory(courseDirectory);

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(courseDirectory, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Path.Combine(BaseUploadPath, courseId.ToString(), uniqueFileName);
        }

        public string GetFileContentType(string filePath)
        {
            var extension = Path.GetExtension(filePath).ToLower();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream"
            };
        }
    }
}
