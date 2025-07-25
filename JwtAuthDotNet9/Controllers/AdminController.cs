using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JwtAuthDotNet9.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController(UserDbContext context) : ControllerBase
    {
        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto roleAssign)
        {
            var user = await context.Users.FindAsync(roleAssign.UserId);
            if (user == null) return NotFound("User not found");

            if (!new[] { "User", "Admin", "Trainer" }.Contains(roleAssign.Role))
                return BadRequest("Invalid role");

            user.Role = roleAssign.Role;
            await context.SaveChangesAsync();
            return Ok();
        }
        [HttpDelete("delete-user/{userId}")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            // Find user including related data
            var user = await context.Users
                .Include(u => u.Enrollments)  // Delete enrollments first if needed
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound("User not found");

            // Prevent deleting yourself
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            if (user.Id == currentUserId)
                return BadRequest("Cannot delete your own account");

            // Handle related data
            context.Enrollments.RemoveRange(user.Enrollments);  // Delete enrollments

            // Delete user
            context.Users.Remove(user);
            await context.SaveChangesAsync();

            return NoContent();
        }
    }
}
