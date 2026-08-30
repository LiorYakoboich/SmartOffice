using System.Text;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using SmartOffice.AuthService.Data;
using SmartOffice.AuthService.Health;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddOpenApi();

// =========================================
// DATABASE
// =========================================

builder.Services.AddDbContext<AuthDbContext>(
    options =>
    {
        var connectionString =
            builder.Configuration
                .GetConnectionString(
                    "DefaultConnection"
                );

        options.UseSqlServer(
            connectionString
        );
    }
);

// =========================================
// HEALTH CHECKS
// =========================================

builder.Services
    .AddHealthChecks()
    .AddCheck<SqlServerHealthCheck>(
        "sqlserver",
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
    Checks whether the API process
    itself is running.
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
    Checks whether the API is ready
    to serve requests, including
    access to SQL Server.
*/

app.MapHealthChecks(
    "/health/ready",
    new HealthCheckOptions
    {
        Predicate =
            healthCheck =>
                healthCheck.Tags.Contains(
                    "ready"
                )
    }
);

app.Run();

public partial class Program
{
}