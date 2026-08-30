using System.Text;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;

using SmartOffice.AssetService.Data;
using SmartOffice.AssetService.Health;

var builder =
    WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddOpenApi();

builder.Services.AddSingleton<MongoDbService>();

// =========================================
// HEALTH CHECKS
// =========================================

builder.Services
    .AddHealthChecks()
    .AddCheck<MongoDbHealthCheck>(
        "mongodb",
        tags: new[]
        {
            "ready"
        }
    );

// =========================================
// CORS
// =========================================

builder.Services.AddCors(
    options =>
    {
        options.AddPolicy(
            "Frontend",
            policy =>
            {
                policy
                    .WithOrigins(
                        "http://localhost:5173"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            }
        );
    }
);

// =========================================
// JWT
// =========================================

var jwtKey =
    builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT key is missing."
    );

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException(
        "JWT issuer is missing."
    );

var jwtAudience =
    builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException(
        "JWT audience is missing."
    );

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(
        options =>
        {
            options.TokenValidationParameters =
                new TokenValidationParameters
                {
                    ValidateIssuer = true,

                    ValidateAudience = true,

                    ValidateLifetime = true,

                    ValidateIssuerSigningKey = true,

                    ValidIssuer = jwtIssuer,

                    ValidAudience = jwtAudience,

                    IssuerSigningKey =
                        new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(
                                jwtKey
                            )
                        ),

                    ClockSkew =
                        TimeSpan.Zero
                };
        }
    );

builder.Services.AddAuthorization();

var app =
    builder.Build();

// =========================================
// DEVELOPMENT
// =========================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// =========================================
// PIPELINE
// =========================================

app.UseHttpsRedirection();

app.UseCors(
    "Frontend"
);

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

// =========================================
// HEALTH ENDPOINTS
// =========================================

/*
    Liveness:
    Is the API process itself running?
*/

app.MapHealthChecks(
    "/health/live",
    new HealthCheckOptions
    {
        Predicate =
            _ => false
    }
);

/*
    Readiness:
    Is the API ready to serve requests,
    including access to MongoDB?
*/

app.MapHealthChecks(
    "/health/ready",
    new HealthCheckOptions
    {
        Predicate =
            check =>
                check.Tags.Contains(
                    "ready"
                )
    }
);

app.Run();

/*
    Required by WebApplicationFactory
    integration tests.
*/

public partial class Program
{
}