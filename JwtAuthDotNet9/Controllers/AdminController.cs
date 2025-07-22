using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    }
}
