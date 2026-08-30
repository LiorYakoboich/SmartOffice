using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using SmartOffice.AuthService.Controllers;
using SmartOffice.AuthService.Data;
using SmartOffice.AuthService.DTOs;
using SmartOffice.AuthService.Models;

namespace SmartOffice.AuthService.Tests.Controllers
{
    public class AuthControllerTests
    {
        // =========================================
        // REGISTER - SUCCESS
        // =========================================

        [Fact]
        public async Task Register_ValidRequest_CreatesMember()
        {
            await using var dbContext =
                CreateDbContext();

            var controller =
                CreateController(
                    dbContext
                );

            var request =
                new RegisterRequest
                {
                    FirstName = "Lior",
                    LastName = "Yakobovich",
                    Name = "lior.test",
                    Password = "Password123"
                };

            var result =
                await controller.Register(
                    request
                );

            var createdResult =
                Assert.IsType<CreatedResult>(
                    result
                );

            Assert.NotNull(
                createdResult.Value
            );

            var user =
                await dbContext.Users
                    .SingleAsync();

            Assert.Equal(
                "lior.test",
                user.Name
            );

            Assert.Equal(
                "Lior",
                user.FirstName
            );

            Assert.Equal(
                "Yakobovich",
                user.LastName
            );

            /*
                Most important security check:

                Public registration must never
                create an Admin account.
            */

            Assert.Equal(
                "Member",
                user.Role
            );

            Assert.False(
                string.IsNullOrWhiteSpace(
                    user.PasswordHash
                )
            );

            Assert.NotEqual(
                request.Password,
                user.PasswordHash
            );
        }

        // =========================================
        // REGISTER - TRIMS VALUES
        // =========================================

        [Fact]
        public async Task Register_ValuesContainSpaces_TrimsUserData()
        {
            await using var dbContext =
                CreateDbContext();

            var controller =
                CreateController(
                    dbContext
                );

            var request =
                new RegisterRequest
                {
                    FirstName = "  Lior  ",
                    LastName = "  Yakobovich  ",
                    Name = "  lior.test  ",
                    Password = "Password123"
                };

            var result =
                await controller.Register(
                    request
                );

            Assert.IsType<CreatedResult>(
                result
            );

            var user =
                await dbContext.Users
                    .SingleAsync();

            Assert.Equal(
                "Lior",
                user.FirstName
            );

            Assert.Equal(
                "Yakobovich",
                user.LastName
            );

            Assert.Equal(
                "lior.test",
                user.Name
            );
        }

        // =========================================
        // REGISTER - DUPLICATE USERNAME
        // =========================================

        [Fact]
        public async Task Register_DuplicateUsernameDifferentCase_ReturnsConflict()
        {
            await using var dbContext =
                CreateDbContext();

            dbContext.Users.Add(
                new User
                {
                    Name = "Lior123",
                    FirstName = "Existing",
                    LastName = "User",
                    PasswordHash = "existing-hash",
                    Role = "Member"
                }
            );

            await dbContext
                .SaveChangesAsync();

            var controller =
                CreateController(
                    dbContext
                );

            var request =
                new RegisterRequest
                {
                    FirstName = "Lior",
                    LastName = "Yakobovich",
                    Name = "lior123",
                    Password = "Password123"
                };

            var result =
                await controller.Register(
                    request
                );

            Assert.IsType<ConflictObjectResult>(
                result
            );

            Assert.Equal(
                1,
                await dbContext.Users.CountAsync()
            );
        }

        // =========================================
        // REGISTER - SHORT PASSWORD
        // =========================================

        [Fact]
        public async Task Register_ShortPassword_ReturnsBadRequest()
        {
            await using var dbContext =
                CreateDbContext();

            var controller =
                CreateController(
                    dbContext
                );

            var request =
                new RegisterRequest
                {
                    FirstName = "Lior",
                    LastName = "Yakobovich",
                    Name = "lior.test",
                    Password = "123"
                };

            var result =
                await controller.Register(
                    request
                );

            Assert.IsType<BadRequestObjectResult>(
                result
            );

            Assert.Empty(
                dbContext.Users
            );
        }

        // =========================================
        // LOGIN - SUCCESS
        // =========================================

        [Fact]
        public async Task Login_ValidCredentials_ReturnsJwtToken()
        {
            await using var dbContext =
                CreateDbContext();

            var user =
                new User
                {
                    Id = 1,
                    Name = "admin.test",
                    FirstName = "Admin",
                    LastName = "Tester",
                    Role = "Admin"
                };

            var passwordHasher =
                new PasswordHasher<User>();

            user.PasswordHash =
                passwordHasher.HashPassword(
                    user,
                    "Password123"
                );

            dbContext.Users.Add(
                user
            );

            await dbContext
                .SaveChangesAsync();

            var controller =
                CreateController(
                    dbContext
                );

            var request =
                new LoginRequest
                {
                    Name = "admin.test",
                    Password = "Password123"
                };

            var result =
                await controller.Login(
                    request
                );

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result
                );

            Assert.NotNull(
                okResult.Value
            );

            /*
                Login returns an anonymous object:

                {
                    token,
                    user
                }

                Reflection lets us inspect it
                without changing production code.
            */

            var tokenProperty =
                okResult.Value
                    .GetType()
                    .GetProperty(
                        "token"
                    );

            Assert.NotNull(
                tokenProperty
            );

            var token =
                tokenProperty.GetValue(
                    okResult.Value
                ) as string;

            Assert.False(
                string.IsNullOrWhiteSpace(
                    token
                )
            );

            // Validate that it is a real JWT.

            var tokenHandler =
                new JwtSecurityTokenHandler();

            Assert.True(
                tokenHandler.CanReadToken(
                    token
                )
            );

            var jwtToken =
                tokenHandler.ReadJwtToken(
                    token
                );

            Assert.Contains(
                jwtToken.Claims,
                claim =>
                    (
                        claim.Type ==
                            ClaimTypes.Role ||
                        claim.Type ==
                            "role"
                    ) &&
                    claim.Value ==
                        "Admin"
            );

            Assert.Contains(
                jwtToken.Claims,
                claim =>
                    claim.Type ==
                        "username" &&
                    claim.Value ==
                        "admin.test"
            );
        }

        // =========================================
        // LOGIN - CASE INSENSITIVE USERNAME
        // =========================================

        [Fact]
        public async Task Login_UsernameDifferentCase_StillSucceeds()
        {
            await using var dbContext =
                CreateDbContext();

            var user =
                new User
                {
                    Id = 1,
                    Name = "LiorTest",
                    FirstName = "Lior",
                    LastName = "Yakobovich",
                    Role = "Member"
                };

            var passwordHasher =
                new PasswordHasher<User>();

            user.PasswordHash =
                passwordHasher.HashPassword(
                    user,
                    "Password123"
                );

            dbContext.Users.Add(
                user
            );

            await dbContext
                .SaveChangesAsync();

            var controller =
                CreateController(
                    dbContext
                );

            var request =
                new LoginRequest
                {
                    Name = "liortest",
                    Password = "Password123"
                };

            var result =
                await controller.Login(
                    request
                );

            Assert.IsType<OkObjectResult>(
                result
            );
        }

        // =========================================
        // LOGIN - WRONG PASSWORD
        // =========================================

        [Fact]
        public async Task Login_WrongPassword_ReturnsUnauthorized()
        {
            await using var dbContext =
                CreateDbContext();

            var user =
                new User
                {
                    Id = 1,
                    Name = "lior.test",
                    FirstName = "Lior",
                    LastName = "Yakobovich",
                    Role = "Member"
                };

            var passwordHasher =
                new PasswordHasher<User>();

            user.PasswordHash =
                passwordHasher.HashPassword(
                    user,
                    "CorrectPassword123"
                );

            dbContext.Users.Add(
                user
            );

            await dbContext
                .SaveChangesAsync();

            var controller =
                CreateController(
                    dbContext
                );

            var request =
                new LoginRequest
                {
                    Name = "lior.test",
                    Password = "WrongPassword"
                };

            var result =
                await controller.Login(
                    request
                );

            Assert.IsType<UnauthorizedObjectResult>(
                result
            );
        }

        // =========================================
        // LOGIN - USER DOES NOT EXIST
        // =========================================

        [Fact]
        public async Task Login_UserDoesNotExist_ReturnsUnauthorized()
        {
            await using var dbContext =
                CreateDbContext();

            var controller =
                CreateController(
                    dbContext
                );

            var request =
                new LoginRequest
                {
                    Name = "does-not-exist",
                    Password = "Password123"
                };

            var result =
                await controller.Login(
                    request
                );

            Assert.IsType<UnauthorizedObjectResult>(
                result
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
        // TEST CONFIGURATION
        // =========================================

        private static IConfiguration
            CreateConfiguration()
        {
            var values =
                new Dictionary<string, string?>
                {
                    [
                        "Jwt:Key"
                    ] =
                        "SmartOffice-Test-Jwt-Key-That-Is-Long-Enough-For-HS256",

                    [
                        "Jwt:Issuer"
                    ] =
                        "SmartOffice.Tests",

                    [
                        "Jwt:Audience"
                    ] =
                        "SmartOffice.Web.Tests",

                    [
                        "Jwt:ExpiresInMinutes"
                    ] =
                        "60"
                };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(
                    values
                )
                .Build();
        }

        // =========================================
        // CONTROLLER
        // =========================================

        private static AuthController
            CreateController(
                AuthDbContext dbContext
            )
        {
            return new AuthController(
                dbContext,
                CreateConfiguration()
            );
        }
    }
}