using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

using SmartOffice.AuthService.Data;

namespace SmartOffice.AuthService.Health
{
    public class SqlServerHealthCheck : IHealthCheck
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public SqlServerHealthCheck(
            IServiceScopeFactory scopeFactory
        )
        {
            _scopeFactory = scopeFactory;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                using var scope =
                    _scopeFactory.CreateScope();

                var dbContext =
                    scope.ServiceProvider
                        .GetRequiredService<AuthDbContext>();

                var canConnect =
                    await dbContext.Database.CanConnectAsync(
                        cancellationToken
                    );

                if (!canConnect)
                {
                    return HealthCheckResult.Unhealthy(
                        "SQL Server is unavailable."
                    );
                }

                return HealthCheckResult.Healthy(
                    "SQL Server is available."
                );
            }
            catch (Exception exception)
            {
                return HealthCheckResult.Unhealthy(
                    "SQL Server is unavailable.",
                    exception
                );
            }
        }
    }
}