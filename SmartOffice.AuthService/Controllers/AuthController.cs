using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using SmartOffice.AuthService.Data;
using SmartOffice.AuthService.DTOs;
using SmartOffice.AuthService.Models;

namespace SmartOffice.AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthDbContext _context;

        private readonly IConfiguration _configuration;

        private readonly PasswordHasher<User> _passwordHasher;

        public AuthController(
            AuthDbContext context,
            IConfiguration configuration
        )
        {
            _context = context;

            _configuration = configuration;

            _passwordHasher =
                new PasswordHasher<User>();
        }

        // =========================================
        // REGISTER
        // =========================================

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            RegisterRequest request
        )
        {
            var firstName =
                request.FirstName.Trim();

            var lastName =
                request.LastName.Trim();

            var username =
                request.Name.Trim();

            if (
                string.IsNullOrWhiteSpace(firstName) ||
                string.IsNullOrWhiteSpace(lastName) ||
                string.IsNullOrWhiteSpace(username) ||
                string.IsNullOrWhiteSpace(request.Password)
            )
            {
                return BadRequest(
                    "First name, last name, username and password are required."
                );
            }

            if (request.Password.Length < 6)
            {
                return BadRequest(
                    "Password must contain at least 6 characters."
                );
            }

            /*
                Username comparison is case-insensitive.

                For example:

                Lior123
                lior123

                are treated as the same username.
            */

            var normalizedUsername =
                username.ToLower();

            var existingUser =
                await _context.Users
                    .FirstOrDefaultAsync(
                        user =>
                            user.Name.ToLower() ==
                            normalizedUsername
                    );

            if (existingUser != null)
            {
                return Conflict(
                    "A user with this username already exists."
                );
            }

            var user = new User
            {
                Name = username,

                FirstName = firstName,

                LastName = lastName,

                /*
                    Public registration can only
                    create Member accounts.
                */

                Role = "Member"
            };

            user.PasswordHash =
                _passwordHasher.HashPassword(
                    user,
                    request.Password
                );

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return Created(
                "",
                new
                {
                    user.Id,

                    Username = user.Name,

                    user.FirstName,

                    user.LastName,

                    Name =
                        GetDisplayName(user),

                    user.Role
                }
            );
        }

        // =========================================
        // LOGIN
        // =========================================

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            LoginRequest request
        )
        {
            var username =
                request.Name.Trim();

            var normalizedUsername =
                username.ToLower();

            var user =
                await _context.Users
                    .FirstOrDefaultAsync(
                        storedUser =>
                            storedUser.Name.ToLower() ==
                            normalizedUsername
                    );

            if (user == null)
            {
                return Unauthorized(
                    "Invalid username or password."
                );
            }

            var verificationResult =
                _passwordHasher.VerifyHashedPassword(
                    user,
                    user.PasswordHash,
                    request.Password
                );

            if (
                verificationResult ==
                PasswordVerificationResult.Failed
            )
            {
                return Unauthorized(
                    "Invalid username or password."
                );
            }

            var token =
                CreateJwtToken(user);

            return Ok(
                new
                {
                    token,

                    user = new
                    {
                        user.Id,

                        Username =
                            user.Name,

                        user.FirstName,

                        user.LastName,

                        /*
                            The frontend can continue
                            using user.name, but now it
                            represents the display name.
                        */

                        Name =
                            GetDisplayName(user),

                        user.Role
                    }
                }
            );
        }

        // =========================================
        // JWT
        // =========================================

        private string CreateJwtToken(
            User user
        )
        {
            var jwtKey =
                _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException(
                    "JWT key is missing."
                );

            var jwtIssuer =
                _configuration["Jwt:Issuer"];

            var jwtAudience =
                _configuration["Jwt:Audience"];

            var expiresInMinutes =
                int.TryParse(
                    _configuration[
                        "Jwt:ExpiresInMinutes"
                    ],
                    out var minutes
                )
                    ? minutes
                    : 60;

            var displayName =
                GetDisplayName(user);

            var claims =
                new List<Claim>
                {
                    /*
                        User ID
                    */

                    new Claim(
                        JwtRegisteredClaimNames.Sub,
                        user.Id.ToString()
                    ),

                    new Claim(
                        ClaimTypes.NameIdentifier,
                        user.Id.ToString()
                    ),

                    /*
                        Human-readable name.

                        ReservationsController already
                        reads ClaimTypes.Name, so
                        BookedBy will automatically
                        become:

                        Lior Yakobovich

                        instead of the login username.
                    */

                    new Claim(
                        ClaimTypes.Name,
                        displayName
                    ),

                    /*
                        Keep username separately.
                    */

                    new Claim(
                        "username",
                        user.Name
                    ),

                    /*
                        Authorization role.
                    */

                    new Claim(
                        ClaimTypes.Role,
                        user.Role
                    )
                };

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        jwtKey
                    )
                );

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256
                );

            var token =
                new JwtSecurityToken(
                    issuer: jwtIssuer,

                    audience: jwtAudience,

                    claims: claims,

                    expires:
                        DateTime.UtcNow
                            .AddMinutes(
                                expiresInMinutes
                            ),

                    signingCredentials:
                        credentials
                );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }

        // =========================================
        // DISPLAY NAME
        // =========================================

        private static string GetDisplayName(
            User user
        )
        {
            var displayName =
                $"{user.FirstName} {user.LastName}"
                    .Trim();

            /*
                Existing users were created before
                FirstName / LastName existed.

                Until those accounts are updated,
                fall back to their username so we
                don't display an empty name.
            */

            return string.IsNullOrWhiteSpace(
                displayName
            )
                ? user.Name
                : displayName;
        }
    }
}