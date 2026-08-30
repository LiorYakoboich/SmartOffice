using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

using MongoDB.Driver;

namespace SmartOffice.AssetService.Tests.Integration
{
    public class AuthorizationTests
    {
        // =========================================
        // NO TOKEN -> 401
        // =========================================

        [Fact]
        public async Task AdminEndpoint_NoToken_ReturnsUnauthorized()
        {
            await using var environment =
                CreateEnvironment();

            var response =
                await environment
                    .Client
                    .GetAsync(
                        "/api/lockers/requests/pending"
                    );

            Assert.Equal(
                HttpStatusCode.Unauthorized,
                response.StatusCode
            );
        }

        // =========================================
        // MEMBER -> ADMIN ENDPOINT -> 403
        // =========================================

        [Fact]
        public async Task AdminEndpoint_MemberToken_ReturnsForbidden()
        {
            await using var environment =
                CreateEnvironment();

            environment.Authenticate(
                userId: "member-1",
                userName: "Member User",
                role: "Member"
            );

            var response =
                await environment
                    .Client
                    .GetAsync(
                        "/api/lockers/requests/pending"
                    );

            Assert.Equal(
                HttpStatusCode.Forbidden,
                response.StatusCode
            );
        }

        // =========================================
        // ADMIN -> ADMIN ENDPOINT -> 200
        // =========================================

        [Fact]
        public async Task AdminEndpoint_AdminToken_ReturnsOk()
        {
            await using var environment =
                CreateEnvironment();

            environment.Authenticate(
                userId: "admin-1",
                userName: "Admin User",
                role: "Admin"
            );

            var response =
                await environment
                    .Client
                    .GetAsync(
                        "/api/lockers/requests/pending"
                    );

            Assert.Equal(
                HttpStatusCode.OK,
                response.StatusCode
            );
        }

        // =========================================
        // ADMIN -> MEMBER ENDPOINT -> 403
        // =========================================

        [Fact]
        public async Task MemberEndpoint_AdminToken_ReturnsForbidden()
        {
            await using var environment =
                CreateEnvironment();

            environment.Authenticate(
                userId: "admin-1",
                userName: "Admin User",
                role: "Admin"
            );

            var response =
                await environment
                    .Client
                    .GetAsync(
                        "/api/lockers/my-requests"
                    );

            Assert.Equal(
                HttpStatusCode.Forbidden,
                response.StatusCode
            );
        }

        // =========================================
        // MEMBER -> MEMBER ENDPOINT -> 200
        // =========================================

        [Fact]
        public async Task MemberEndpoint_MemberToken_ReturnsOk()
        {
            await using var environment =
                CreateEnvironment();

            environment.Authenticate(
                userId: "member-1",
                userName: "Member User",
                role: "Member"
            );

            var response =
                await environment
                    .Client
                    .GetAsync(
                        "/api/lockers/my-requests"
                    );

            Assert.Equal(
                HttpStatusCode.OK,
                response.StatusCode
            );
        }

        // =========================================
        // ENVIRONMENT
        // =========================================

        private static AssetServiceTestEnvironment
            CreateEnvironment()
        {
            return new AssetServiceTestEnvironment();
        }

        private sealed class AssetServiceTestEnvironment :
            IAsyncDisposable
        {
            private const string
                MongoConnectionString =
                    "mongodb://localhost:27017";

            /*
                The exact same JWT settings are used
                both to create the test token and to
                configure JwtBearer validation.

                This is important because Program.cs
                reads its JWT configuration while the
                application is being built.
            */

            private const string
                TestJwtKey =
                    "SmartOffice-Integration-Test-Jwt-Key-For-HS256-2026";

            private const string
                TestJwtIssuer =
                    "SmartOffice.IntegrationTests";

            private const string
                TestJwtAudience =
                    "SmartOffice.IntegrationTests.Client";

            private readonly MongoClient
                _mongoClient;

            private readonly WebApplicationFactory<Program>
                _factory;

            public string DatabaseName
            {
                get;
            }

            public HttpClient Client
            {
                get;
            }

            public AssetServiceTestEnvironment()
            {
                DatabaseName =
                    $"SmartOfficeAuthorizationTests_{Guid.NewGuid():N}";

                _factory =
                    new WebApplicationFactory<Program>()
                        .WithWebHostBuilder(
                            builder =>
                            {
                                builder.UseEnvironment(
                                    "Testing"
                                );

                                // =================================
                                // TEST CONFIGURATION
                                // =================================

                                builder.ConfigureAppConfiguration(
                                    (
                                        _,
                                        configuration
                                    ) =>
                                    {
                                        var testSettings =
                                            new Dictionary<
                                                string,
                                                string?
                                            >
                                            {
                                                [
                                                    "MongoDb:ConnectionString"
                                                ] =
                                                    MongoConnectionString,

                                                [
                                                    "MongoDb:DatabaseName"
                                                ] =
                                                    DatabaseName,

                                                [
                                                    "Jwt:Key"
                                                ] =
                                                    TestJwtKey,

                                                [
                                                    "Jwt:Issuer"
                                                ] =
                                                    TestJwtIssuer,

                                                [
                                                    "Jwt:Audience"
                                                ] =
                                                    TestJwtAudience
                                            };

                                        configuration
                                            .AddInMemoryCollection(
                                                testSettings
                                            );
                                    }
                                );

                                // =================================
                                // FORCE JWT TEST SETTINGS
                                // =================================

                                builder.ConfigureTestServices(
                                    services =>
                                    {
                                        /*
                                            Program.cs already registered
                                            JwtBearer authentication.

                                            For integration tests we override
                                            the validation settings so the
                                            server validates tokens with the
                                            exact same key used below.
                                        */

                                        services.PostConfigure<
                                            JwtBearerOptions
                                        >(
                                            JwtBearerDefaults
                                                .AuthenticationScheme,

                                            options =>
                                            {
                                                options
                                                    .TokenValidationParameters =
                                                    new TokenValidationParameters
                                                    {
                                                        ValidateIssuer =
                                                            true,

                                                        ValidateAudience =
                                                            true,

                                                        ValidateLifetime =
                                                            true,

                                                        ValidateIssuerSigningKey =
                                                            true,

                                                        ValidIssuer =
                                                            TestJwtIssuer,

                                                        ValidAudience =
                                                            TestJwtAudience,

                                                        IssuerSigningKey =
                                                            new SymmetricSecurityKey(
                                                                Encoding.UTF8
                                                                    .GetBytes(
                                                                        TestJwtKey
                                                                    )
                                                            ),

                                                        ClockSkew =
                                                            TimeSpan.Zero
                                                    };
                                            }
                                        );
                                    }
                                );
                            }
                        );

                Client =
                    _factory.CreateClient(
                        new WebApplicationFactoryClientOptions
                        {
                            BaseAddress =
                                new Uri(
                                    "https://localhost"
                                ),

                            AllowAutoRedirect =
                                false
                        }
                    );

                _mongoClient =
                    new MongoClient(
                        MongoConnectionString
                    );
            }

            // =========================================
            // JWT AUTHENTICATION
            // =========================================

            public void Authenticate(
                string userId,
                string userName,
                string role
            )
            {
                var claims =
                    new List<Claim>
                    {
                        new(
                            JwtRegisteredClaimNames.Sub,
                            userId
                        ),

                        new(
                            ClaimTypes.NameIdentifier,
                            userId
                        ),

                        new(
                            ClaimTypes.Name,
                            userName
                        ),

                        new(
                            ClaimTypes.Role,
                            role
                        )
                    };

                var securityKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8
                            .GetBytes(
                                TestJwtKey
                            )
                    );

                var credentials =
                    new SigningCredentials(
                        securityKey,
                        SecurityAlgorithms.HmacSha256
                    );

                var token =
                    new JwtSecurityToken(
                        issuer:
                            TestJwtIssuer,

                        audience:
                            TestJwtAudience,

                        claims:
                            claims,

                        notBefore:
                            DateTime.UtcNow
                                .AddMinutes(-1),

                        expires:
                            DateTime.UtcNow
                                .AddMinutes(30),

                        signingCredentials:
                            credentials
                    );

                var tokenValue =
                    new JwtSecurityTokenHandler()
                        .WriteToken(
                            token
                        );

                Client
                    .DefaultRequestHeaders
                    .Authorization =
                    new AuthenticationHeaderValue(
                        "Bearer",
                        tokenValue
                    );
            }

            // =========================================
            // CLEANUP
            // =========================================

            public async ValueTask
                DisposeAsync()
            {
                Client.Dispose();

                _factory.Dispose();

                await _mongoClient
                    .DropDatabaseAsync(
                        DatabaseName
                    );
            }
        }
    }
}