using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SmartOffice.AuthService.Data;
using SmartOffice.AuthService.Dtos;
using SmartOffice.AuthService.Models;

namespace SmartOffice.AuthService.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly AuthDbContext _dbContext;

        public UsersController(
            AuthDbContext dbContext
        )
        {
            _dbContext =
                dbContext;
        }

        // =========================================
        // ADMIN - GET ALL USERS
        // =========================================

        [HttpGet]
        public async Task<ActionResult<List<UserManagementResponse>>>
            GetUsers()
        {
            var users =
                await _dbContext
                    .Users
                    .AsNoTracking()
                    .OrderBy(
                        user =>
                            user.FirstName
                    )
                    .ThenBy(
                        user =>
                            user.LastName
                    )
                    .ThenBy(
                        user =>
                            user.Name
                    )
                    .ToListAsync();

            var response =
                users
                    .Select(
                        ToResponse
                    )
                    .ToList();

            return Ok(
                response
            );
        }

        // =========================================
        // ADMIN - UPDATE USER ROLE
        // =========================================

        [HttpPut("{userId:int}/role")]
        public async Task<ActionResult<UserManagementResponse>>
            UpdateUserRole(
                int userId,
                UpdateUserRoleRequest request
            )
        {
            var requestedRole =
                request.Role
                    ?.Trim();

            if (
                string.IsNullOrWhiteSpace(
                    requestedRole
                )
            )
            {
                return BadRequest(
                    "Role is required."
                );
            }

            var normalizedRole =
                NormalizeRole(
                    requestedRole
                );

            if (
                normalizedRole ==
                null
            )
            {
                return BadRequest(
                    "Role must be Member or Admin."
                );
            }

            var user =
                await _dbContext
                    .Users
                    .FirstOrDefaultAsync(
                        existingUser =>
                            existingUser.Id ==
                            userId
                    );

            if (
                user ==
                null
            )
            {
                return NotFound(
                    "User not found."
                );
            }

            var currentUserId =
                GetCurrentUserId();

            /*
                Prevent an Admin from accidentally
                removing their own Admin permissions.

                Otherwise the current administrator
                could lock themselves out of the
                management area.
            */

            if (
                currentUserId ==
                    userId &&
                normalizedRole !=
                    "Admin"
            )
            {
                return Conflict(
                    "You cannot remove your own Admin role."
                );
            }

            /*
                No database write is needed when
                the role is already correct.
            */

            if (
                user.Role ==
                normalizedRole
            )
            {
                return Ok(
                    ToResponse(
                        user
                    )
                );
            }

            user.Role =
                normalizedRole;

            await _dbContext
                .SaveChangesAsync();

            return Ok(
                ToResponse(
                    user
                )
            );
        }

        // =========================================
        // HELPERS
        // =========================================

        private int
            GetCurrentUserId()
        {
            var value =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            return int.TryParse(
                value,
                out var userId
            )
                ? userId
                : 0;
        }

        private static string?
            NormalizeRole(
                string role
            )
        {
            if (
                role.Equals(
                    "Member",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                return "Member";
            }

            if (
                role.Equals(
                    "Admin",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                return "Admin";
            }

            return null;
        }

        private static UserManagementResponse
            ToResponse(
                User user
            )
        {
            var firstName =
                user.FirstName
                    ?.Trim()
                ?? string.Empty;

            var lastName =
                user.LastName
                    ?.Trim()
                ?? string.Empty;

            var displayName =
                $"{firstName} {lastName}"
                    .Trim();

            /*
                Older users may not have FirstName
                and LastName populated.

                In that case, show their username
                rather than returning an empty name.
            */

            if (
                string.IsNullOrWhiteSpace(
                    displayName
                )
            )
            {
                displayName =
                    user.Name;
            }

            return new UserManagementResponse
            {
                Id =
                    user.Id,

                Username =
                    user.Name,

                FirstName =
                    firstName,

                LastName =
                    lastName,

                DisplayName =
                    displayName,

                Role =
                    user.Role
            };
        }
    }
}