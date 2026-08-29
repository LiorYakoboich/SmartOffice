using MongoDB.Bson;
using MongoDB.Driver;
using SmartOffice.AssetService.Models;

namespace SmartOffice.AssetService.Data
{
    public class MongoDbService
    {
        private readonly IMongoCollection<Asset> _assets;
        private readonly IMongoCollection<Reservation> _reservations;

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

            var client =
                new MongoClient(connectionString);

            var database =
                client.GetDatabase(databaseName);

            _assets =
                database.GetCollection<Asset>(
                    "Assets"
                );

            _reservations =
                database.GetCollection<Reservation>(
                    "Reservations"
                );
        }

        // =========================================
        // ASSETS
        // =========================================

        public async Task<List<Asset>>
            GetAllAsync()
        {
            return await _assets
                .Find(_ => true)
                .ToListAsync();
        }

        public async Task<Asset?>
            GetByIdAsync(
                string id
            )
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return null;
            }

            return await _assets
                .Find(
                    asset =>
                        asset.Id == id
                )
                .FirstOrDefaultAsync();
        }

        public async Task<Asset>
            CreateAsync(
                Asset asset
            )
        {
            asset.CreatedAt =
                DateTime.UtcNow;

            await _assets.InsertOneAsync(
                asset
            );

            return asset;
        }

        public async Task<Asset?>
            UpdateAssetAsync(
                string id,
                string location,
                string status
            )
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return null;
            }

            var update =
                Builders<Asset>.Update
                    .Set(
                        asset =>
                            asset.Location,
                        location
                    )
                    .Set(
                        asset =>
                            asset.Status,
                        status
                    );

            var options =
                new FindOneAndUpdateOptions<
                    Asset,
                    Asset
                >
                {
                    ReturnDocument =
                        ReturnDocument.After
                };

            return await _assets
                .FindOneAndUpdateAsync(
                    asset =>
                        asset.Id == id,
                    update,
                    options
                );
        }

        public async Task<bool>
            DeleteAsync(
                string id
            )
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return false;
            }

            var result =
                await _assets.DeleteOneAsync(
                    asset =>
                        asset.Id == id
                );

            return result.DeletedCount > 0;
        }

        // =========================================
        // RESERVATIONS
        // =========================================

        public async Task<List<Reservation>>
            GetReservationsAsync()
        {
            return await _reservations
                .Find(_ => true)
                .SortBy(
                    reservation =>
                        reservation.StartTimeUtc
                )
                .ToListAsync();
        }

        public async Task<List<Reservation>>
            GetReservationsForAssetAsync(
                string assetId
            )
        {
            return await _reservations
                .Find(
                    reservation =>
                        reservation.AssetId ==
                        assetId
                )
                .SortBy(
                    reservation =>
                        reservation.StartTimeUtc
                )
                .ToListAsync();
        }

        public async Task<Reservation?>
            GetReservationByIdAsync(
                string id
            )
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return null;
            }

            return await _reservations
                .Find(
                    reservation =>
                        reservation.Id == id
                )
                .FirstOrDefaultAsync();
        }

        public async Task<bool>
            HasReservationConflictAsync(
                string assetId,
                DateTime startTimeUtc,
                DateTime endTimeUtc
            )
        {
            var conflictFilter =
                Builders<Reservation>.Filter.And(
                    Builders<Reservation>.Filter.Eq(
                        reservation =>
                            reservation.AssetId,
                        assetId
                    ),

                    Builders<Reservation>.Filter.Lt(
                        reservation =>
                            reservation.StartTimeUtc,
                        endTimeUtc
                    ),

                    Builders<Reservation>.Filter.Gt(
                        reservation =>
                            reservation.EndTimeUtc,
                        startTimeUtc
                    )
                );

            return await _reservations
                .Find(conflictFilter)
                .AnyAsync();
        }

        // =========================================
        // ACTIVE / FUTURE RESERVATIONS
        // =========================================

        public async Task<List<Reservation>>
            GetActiveOrFutureReservationsAsync(
                string assetId
            )
        {
            var nowUtc =
                DateTime.UtcNow;

            /*
                Any reservation that has not ended yet
                is still relevant.

                This includes:

                - reservation active right now
                - reservation later today
                - future reservation
            */

            var filter =
                Builders<Reservation>.Filter.And(
                    Builders<Reservation>.Filter.Eq(
                        reservation =>
                            reservation.AssetId,
                        assetId
                    ),

                    Builders<Reservation>.Filter.Gt(
                        reservation =>
                            reservation.EndTimeUtc,
                        nowUtc
                    )
                );

            return await _reservations
                .Find(filter)
                .SortBy(
                    reservation =>
                        reservation.StartTimeUtc
                )
                .ToListAsync();
        }

        public async Task<bool>
            HasActiveOrFutureReservationsAsync(
                string assetId
            )
        {
            var nowUtc =
                DateTime.UtcNow;

            var filter =
                Builders<Reservation>.Filter.And(
                    Builders<Reservation>.Filter.Eq(
                        reservation =>
                            reservation.AssetId,
                        assetId
                    ),

                    Builders<Reservation>.Filter.Gt(
                        reservation =>
                            reservation.EndTimeUtc,
                        nowUtc
                    )
                );

            return await _reservations
                .Find(filter)
                .AnyAsync();
        }

        public async Task<Reservation>
            CreateReservationAsync(
                Reservation reservation
            )
        {
            reservation.CreatedAtUtc =
                DateTime.UtcNow;

            await _reservations
                .InsertOneAsync(
                    reservation
                );

            return reservation;
        }

        public async Task<bool>
            DeleteReservationAsync(
                string id
            )
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return false;
            }

            var result =
                await _reservations
                    .DeleteOneAsync(
                        reservation =>
                            reservation.Id == id
                    );

            return result.DeletedCount > 0;
        }
    }
}