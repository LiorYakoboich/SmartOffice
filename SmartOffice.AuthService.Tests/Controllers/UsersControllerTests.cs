using System.Security.Claims;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SmartOffice.AuthService.Controllers;
using SmartOffice.AuthService.Data;
using SmartOffice.AuthService.Dtos;
using SmartOffice.AuthService.Models;

namespace SmartOffice.AuthService.Tests.Controllers
{
    public class UsersControllerTests
    {
        // =========================================
        // GET USERS
        // =========================================

        [Fact]
        public async Task GetUsers_ReturnsAllUsers()
        {
            await using var dbContext =
                CreateDbContext();

            dbContext.Users.AddRange(
                new User
                {
                    Id = 1,
                    Name = "admin",
                    FirstName = "Admin",
                    LastName = "User",
                    PasswordHash = "hash",
                    Role = "Admin"
                },

                new User
                {
                    Id = 2,
                    Name = "maya",
                    FirstName = "Maya",
                    LastName = "Cohen",
                    PasswordHash = "hash",
                    Role = "Member"
                }
            );

            await dbContext
                .SaveChangesAsync();

            var controller =
                CreateController(
                    dbContext,
                    currentUserId: 1
                );

            var result =
                await controller
                    .GetUsers();

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var users =
                Assert.IsAssignableFrom<
                    List<UserManagementResponse>
                >(
                    okResult.Value
                );

            Assert.Equal(
                2,
                users.Count
            );

            Assert.Contains(
                users,
                user =>
                    user.Username ==
                    "admin"
            );

            Assert.Contains(
                users,
                user =>
                    user.Username ==
                    "maya"
            );
        }

        // =========================================
        // DISPLAY NAME FALLBACK
        // =========================================

        [Fact]
        public async Task GetUsers_WhenNamesAreEmpty_UsesUsernameAsDisplayName()
        {
            await using var dbContext =
                CreateDbContext();

            dbContext.Users.Add(
                new User
                {
                    Id = 1,
                    Name = "legacy-user",
                    FirstName = string.Empty,
                    LastName = string.Empty,
                    PasswordHash = "hash",
                    Role = "Admin"
                }
            );

            await dbContext
                .SaveChangesAsync();

            var controller =
                CreateController(
                    dbContext,
                    currentUserId: 1
                );

            var result =
                await controller
                    .GetUsers();

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var users =
                Assert.IsAssignableFrom<
                    List<UserManagementResponse>
                >(
                    okResult.Value
                );

            var user =
                Assert.Single(
                    users
                );

            Assert.Equal(
                "legacy-user",
                user.DisplayName
            );
        }

        // =========================================
        // PROMOTE MEMBER TO ADMIN
        // =========================================

        [Fact]
        public async Task UpdateUserRole_MemberToAdmin_UpdatesRole()
        {
            await using var dbContext =
                CreateDbContext();

            dbContext.Users.AddRange(
                new User
                {
                    Id = 1,
                    Name = "admin",
                    FirstName = "Admin",
                    LastName = "User",
                    PasswordHash = "hash",
                    Role = "Admin"
                },

                new User
                {
                    Id = 2,
                    Name = "member",
                    FirstName = "Member",
                    LastName = "User",
                    PasswordHash = "hash",
                    Role = "Member"
                }
            );

            await dbContext
                .SaveChangesAsync();

            var controller =
                CreateController(
                    dbContext,
                    currentUserId: 1
                );

            var request =
                new UpdateUserRoleRequest
                {
                    Role = "Admin"
                };

            var result =
                await controller
                    .UpdateUserRole(
                        2,
                        request
                    );

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var response =
                Assert.IsType<UserManagementResponse>(
                    okResult.Value
                );

            Assert.Equal(
                "Admin",
                response.Role
            );

            var updatedUser =
                await dbContext
                    .Users
                    .FindAsync(
                        2
                    );

            Assert.NotNull(
                updatedUser
            );

            Assert.Equal(
                "Admin",
                updatedUser.Role
            );
        }

        // =========================================
        // INVALID ROLE
        // =========================================

        [Fact]
        public async Task UpdateUserRole_InvalidRole_ReturnsBadRequest()
        {
            await using var dbContext =
                CreateDbContext();

            dbContext.Users.Add(
                new User
                {
                    Id = 2,
                    Name = "member",
                    FirstName = "Member",
                    LastName = "User",
                    PasswordHash = "hash",
                    Role = "Member"
                }
            );

            await dbContext
                .SaveChangesAsync();

            var controller =
                CreateController(
                    dbContext,
                    currentUserId: 1
                );

            var request =
                new UpdateUserRoleRequest
                {
                    Role = "SuperAdmin"
                };

            var result =
                await controller
                    .UpdateUserRole(
                        2,
                        request
                    );

            Assert.IsType<BadRequestObjectResult>(
                result.Result
            );

            var user =
                await dbContext
                    .Users
                    .FindAsync(
                        2
                    );

            Assert.NotNull(
                user
            );

            Assert.Equal(
                "Member",
                user.Role
            );
        }

        // =========================================
        // ADMIN CANNOT DEMOTE THEMSELVES
        // =========================================

        [Fact]
        public async Task UpdateUserRole_AdminDemotesSelf_ReturnsConflict()
        {
            await using var dbContext =
                CreateDbContext();

            dbContext.Users.Add(
                new User
                {
                    Id = 1,
                    Name = "admin",
                    FirstName = "Admin",
                    LastName = "User",
                    PasswordHash = "hash",
                    Role = "Admin"
                }
            );

            await dbContext
                .SaveChangesAsync();

            var controller =
                CreateController(
                    dbContext,
                    currentUserId: 1
                );

            var request =
                new UpdateUserRoleRequest
                {
                    Role = "Member"
                };

            var result =
                await controller
                    .UpdateUserRole(
                        1,
                        request
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var admin =
                await dbContext
                    .Users
                    .FindAsync(
                        1
                    );

            Assert.NotNull(
                admin
            );

            Assert.Equal(
                "Admin",
                admin.Role
            );
        }

        // =========================================
        // USER NOT FOUND
        // =========================================

        [Fact]
        public async Task UpdateUserRole_UserDoesNotExist_ReturnsNotFound()
        {
            await using var dbContext =
                CreateDbContext();

            var controller =
                CreateController(
                    dbContext,
                    currentUserId: 1
                );

            var request =
                new UpdateUserRoleRequest
                {
                    Role = "Admin"
                };

            var result =
                await controller
                    .UpdateUserRole(
                        999,
                        request
                    );

            Assert.IsType<NotFoundObjectResult>(
                result.Result
            );
        }

        // =========================================
        // TEST DATABASE
        // =========================================

        private static AuthDbContext
            CreateDbContext()
        {
            var options =
                new DbContextOptionsBuilder<AuthDbContext>()
                    .UseInMemoryDatabase(
                        Guid.NewGuid()
                            .ToString()
                    )
                    .Options;

            return new AuthDbContext(
                options
            );
        }

        // =========================================
        // AUTHENTICATED ADMIN
        // =========================================

        private static UsersController
            CreateController(
                AuthDbContext dbContext,
                int currentUserId
            )
        {
            var controller =
                new UsersController(
                    dbContext
                );

            var claims =
                new List<Claim>
                {
                    new(
                        ClaimTypes.NameIdentifier,
                        currentUserId.ToString()
                    ),

                    new(
                        ClaimTypes.Name,
                        "Test Admin"
                    ),

                    new(
                        ClaimTypes.Role,
                        "Admin"
                    )
                };

            var identity =
                new ClaimsIdentity(
                    claims,
                    "TestAuthentication"
                );

            var principal =
                new ClaimsPrincipal(
                    identity
                );

            controller.ControllerContext =
                new ControllerContext
                {
                    HttpContext =
                        new DefaultHttpContext
                        {
                            User =
                                principal
                        }
                };

            return controller;
        }
    }
}