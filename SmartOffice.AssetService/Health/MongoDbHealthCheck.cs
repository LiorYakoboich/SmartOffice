using Microsoft.Extensions.Diagnostics.HealthChecks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace SmartOffice.AssetService.Health
{
    public class MongoDbHealthCheck : IHealthCheck
    {
        private readonly IConfiguration _configuration;

        public MongoDbHealthCheck(
            IConfiguration configuration
        )
        {
            _configuration = configuration;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var connectionString =
                    _configuration["MongoDb:ConnectionString"];

                var databaseName =
                    _configuration["MongoDb:DatabaseName"];

                if (
                    string.IsNullOrWhiteSpace(connectionString) ||
                    string.IsNullOrWhiteSpace(databaseName)
                )
                {
                    return HealthCheckResult.Unhealthy(
                        "MongoDB configuration is missing."
                    );
                }

                var client =
                    new MongoClient(connectionString);

                var database =
                    client.GetDatabase(databaseName);

                await database.RunCommandAsync<BsonDocument>(
                    new BsonDocument("ping", 1),
                    cancellationToken: cancellationToken
                );

                return HealthCheckResult.Healthy(
                    "MongoDB is available."
                );
            }
            catch (Exception exception)
            {
                return HealthCheckResult.Unhealthy(
                    "MongoDB is unavailable.",
                    exception
                );
            }
        }
    }
}