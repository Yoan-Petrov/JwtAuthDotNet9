using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using JwtAuthDotNet9.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JwtAuthDotNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService, UserDbContext context) : ControllerBase
    {

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserDto request)
        {
            var user = await authService.RegisterAsync(request);
            if (user is null)
                return BadRequest("Email already in use");

            return Ok(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName
            });
        }
        [HttpPost("login")]
        public async Task<ActionResult<TokenResponseDto>> Login(LoginDto request)
        {
            var result = await authService.LoginAsync(request);
            if (result is null)
                return BadRequest("Invalid Username or password.");

            return Ok(result);
        }
        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto request)
        {
            var result = await authService.RefreshTokensAsync(request);
            if (result is null || result.AccessToken is null || result.RefreshToken is null)
                return Unauthorized("Invalid refresh token.");
            return Ok(result);
        }
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // Get the current user's ID from the JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            // Find the user in database
            var user = await context.Users.FindAsync(userGuid);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Invalidate the refresh token (if you're using refresh tokens)
            user.RefreshToken = null;
            //user.RefreshTokenExpiry = null;

            await context.SaveChangesAsync();

            return Ok(new { message = "Successfully logged out" });
        }
        [HttpGet("get-role")]
        [Authorize] // Requires valid token
        public async Task<ActionResult<string>> GetUserRole()
        {
            // Get user ID from the token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Query database for role
            var user = await context.Users
                .Where(u => u.Id == Guid.Parse(userId))
                .Select(u => new { u.Role })
                .FirstOrDefaultAsync();

            return user?.Role ?? "User"; // Default to "User" if not found
        }
        [Authorize]
        [HttpGet]
        public IActionResult AuthenticatedOnlyEndpoint()
        {
            return Ok("You are authenticated!");
        }

        [Authorize(Roles = "Admin,")]
        [HttpGet("admin-only")]
        public IActionResult AdminOnlyEndpoint()
        {
            return Ok("You are authenticated!");
        }
        [Authorize(Roles = "Trainer,")]
        [HttpGet("trainer-only")]
        public IActionResult TrainerOnlyEndpoint()
        {
            return Ok("You are trainer!");
        }
        [Authorize(Roles = "User")]
        [HttpGet("user-only")]
        public IActionResult UserOnlyEndpoint()
        {
            return Ok("You are a valid User!");
        }
    }
}