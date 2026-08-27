using MongoDB.Driver;
using SmartOffice.AssetService.Models;

namespace SmartOffice.AssetService.Data
{
    public class MongoDbService
    {
        private readonly IMongoCollection<Asset> _assets;

        public MongoDbService(IConfiguration configuration)
        {
            var connectionString =
                configuration["MongoDb:ConnectionString"]
                ?? throw new InvalidOperationException(
                    "MongoDB connection string is missing."
                );

            var databaseName =
                configuration["MongoDb:DatabaseName"]
                ?? throw new InvalidOperationException(
                    "MongoDB database name is missing."
                );

            var client = new MongoClient(connectionString);

            var database = client.GetDatabase(databaseName);

            _assets = database.GetCollection<Asset>("Assets");
        }

        public async Task<List<Asset>> GetAllAsync()
        {
            return await _assets
                .Find(_ => true)
                .ToListAsync();
        }

        public async Task<Asset> CreateAsync(Asset asset)
        {
            asset.CreatedAt = DateTime.UtcNow;

            await _assets.InsertOneAsync(asset);

            return asset;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _assets.DeleteOneAsync(
                asset => asset.Id == id
            );

            return result.DeletedCount > 0;
        }
    }
}