using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JwtAuthDotNet9.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController(UserDbContext context) : ControllerBase
    {

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            return await context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.Role
                })
                .ToListAsync();
        }
        [HttpPut("update-user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] UserUpdateDto updateDto)
        {
            // 1. Validate model
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 2. Find user
            var user = await context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found");

            // 3. Update allowed fields
            user.FirstName = updateDto.FirstName;
            user.LastName = updateDto.LastName;
            user.Email = updateDto.Email;

            // 4. Save changes
            try
            {
                await context.SaveChangesAsync();
                return Ok(new
                {
                    Message = "User updated successfully",
                    User = new UserDto
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email
                    }
                });
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, "Error updating user: " + ex.Message);
            }
        }
    }
}
