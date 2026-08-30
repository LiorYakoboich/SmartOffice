using MongoDB.Bson;
using MongoDB.Driver;

using SmartOffice.AssetService.Models;

namespace SmartOffice.AssetService.Data
{
    public class EquipmentRequestService
    {
        private readonly IMongoCollection<EquipmentRequest>
            _equipmentRequests;

        public EquipmentRequestService(
            IConfiguration configuration
        )
        {
            var connectionString =
                configuration[
                    "MongoDb:ConnectionString"
                ]
                ?? throw new InvalidOperationException(
                    "MongoDB connection string is missing."
                );

            var databaseName =
                configuration[
                    "MongoDb:DatabaseName"
                ]
                ?? throw new InvalidOperationException(
                    "MongoDB database name is missing."
                );

            var client =
                new MongoClient(
                    connectionString
                );

            var database =
                client.GetDatabase(
                    databaseName
                );

            _equipmentRequests =
                database.GetCollection<EquipmentRequest>(
                    "EquipmentRequests"
                );
        }

        // =========================================
        // GET BY ID
        // =========================================

        public async Task<EquipmentRequest?>
            GetByIdAsync(
                string id
            )
        {
            if (
                !ObjectId.TryParse(
                    id,
                    out _
                )
            )
            {
                return null;
            }

            return await _equipmentRequests
                .Find(
                    request =>
                        request.Id ==
                        id
                )
                .FirstOrDefaultAsync();
        }

        // =========================================
        // ACTIVE REQUEST FOR EQUIPMENT
        // =========================================

        public async Task<EquipmentRequest?>
            GetActiveRequestForAssetAsync(
                string assetId
            )
        {
            return await _equipmentRequests
                .Find(
                    request =>
                        request.AssetId ==
                            assetId &&
                        request.IsActive
                )
                .FirstOrDefaultAsync();
        }

        public async Task<bool>
            HasActiveRequestForAssetAsync(
                string assetId
            )
        {
            return await _equipmentRequests
                .Find(
                    request =>
                        request.AssetId ==
                            assetId &&
                        request.IsActive
                )
                .AnyAsync();
        }

        // =========================================
        // MEMBER REQUESTS
        // =========================================

        public async Task<List<EquipmentRequest>>
            GetRequestsForUserAsync(
                string userId
            )
        {
            return await _equipmentRequests
                .Find(
                    request =>
                        request.RequestedByUserId ==
                        userId
                )
                .SortByDescending(
                    request =>
                        request.RequestedAtUtc
                )
                .ToListAsync();
        }

        public async Task<List<EquipmentRequest>>
            GetActiveRequestsForUserAsync(
                string userId
            )
        {
            return await _equipmentRequests
                .Find(
                    request =>
                        request.RequestedByUserId ==
                            userId &&
                        request.IsActive
                )
                .SortByDescending(
                    request =>
                        request.RequestedAtUtc
                )
                .ToListAsync();
        }

        // =========================================
        // ADMIN
        // =========================================

        public async Task<List<EquipmentRequest>>
            GetActiveRequestsAsync()
        {
            return await _equipmentRequests
                .Find(
                    request =>
                        request.IsActive
                )
                .SortBy(
                    request =>
                        request.RequestedAtUtc
                )
                .ToListAsync();
        }

        public async Task<List<EquipmentRequest>>
            GetPendingRequestsAsync()
        {
            return await _equipmentRequests
                .Find(
                    request =>
                        request.IsActive &&
                        request.Status ==
                            "Pending"
                )
                .SortBy(
                    request =>
                        request.RequestedAtUtc
                )
                .ToListAsync();
        }

        // =========================================
        // CREATE
        // =========================================

        public async Task<EquipmentRequest>
            CreateAsync(
                EquipmentRequest request
            )
        {
            request.Status =
                "Pending";

            request.IsActive =
                true;

            request.RequestedAtUtc =
                DateTime.UtcNow;

            await _equipmentRequests
                .InsertOneAsync(
                    request
                );

            return request;
        }

        // =========================================
        // APPROVE
        // =========================================

        public async Task<EquipmentRequest?>
            ApproveAsync(
                string id,
                string reviewerUserId,
                string reviewerName
            )
        {
            var update =
                Builders<EquipmentRequest>
                    .Update
                    .Set(
                        request =>
                            request.Status,
                        "Approved"
                    )
                    .Set(
                        request =>
                            request.ReviewedByUserId,
                        reviewerUserId
                    )
                    .Set(
                        request =>
                            request.ReviewedBy,
                        reviewerName
                    )
                    .Set(
                        request =>
                            request.ReviewedAtUtc,
                        DateTime.UtcNow
                    );

            return await UpdateAsync(
                id,
                update
            );
        }

        // =========================================
        // REJECT
        // =========================================

        public async Task<EquipmentRequest?>
            RejectAsync(
                string id,
                string reviewerUserId,
                string reviewerName
            )
        {
            var update =
                Builders<EquipmentRequest>
                    .Update
                    .Set(
                        request =>
                            request.Status,
                        "Rejected"
                    )
                    .Set(
                        request =>
                            request.IsActive,
                        false
                    )
                    .Set(
                        request =>
                            request.ReviewedByUserId,
                        reviewerUserId
                    )
                    .Set(
                        request =>
                            request.ReviewedBy,
                        reviewerName
                    )
                    .Set(
                        request =>
                            request.ReviewedAtUtc,
                        DateTime.UtcNow
                    );

            return await UpdateAsync(
                id,
                update
            );
        }

        // =========================================
        // COLLECT
        // =========================================

        public async Task<EquipmentRequest?>
            MarkCollectedAsync(
                string id
            )
        {
            var update =
                Builders<EquipmentRequest>
                    .Update
                    .Set(
                        request =>
                            request.Status,
                        "Collected"
                    )
                    .Set(
                        request =>
                            request.CollectedAtUtc,
                        DateTime.UtcNow
                    );

            return await UpdateAsync(
                id,
                update
            );
        }

        // =========================================
        // RETURN
        // =========================================

        public async Task<EquipmentRequest?>
            MarkReturnedAsync(
                string id
            )
        {
            var update =
                Builders<EquipmentRequest>
                    .Update
                    .Set(
                        request =>
                            request.Status,
                        "Returned"
                    )
                    .Set(
                        request =>
                            request.IsActive,
                        false
                    )
                    .Set(
                        request =>
                            request.ReturnedAtUtc,
                        DateTime.UtcNow
                    );

            return await UpdateAsync(
                id,
                update
            );
        }

        // =========================================
        // CANCEL
        // =========================================

        public async Task<EquipmentRequest?>
            CancelAsync(
                string id
            )
        {
            var update =
                Builders<EquipmentRequest>
                    .Update
                    .Set(
                        request =>
                            request.Status,
                        "Cancelled"
                    )
                    .Set(
                        request =>
                            request.IsActive,
                        false
                    )
                    .Set(
                        request =>
                            request.CancelledAtUtc,
                        DateTime.UtcNow
                    );

            return await UpdateAsync(
                id,
                update
            );
        }

        // =========================================
        // PRIVATE UPDATE
        // =========================================

        private async Task<EquipmentRequest?>
            UpdateAsync(
                string id,
                UpdateDefinition<EquipmentRequest> update
            )
        {
            if (
                !ObjectId.TryParse(
                    id,
                    out _
                )
            )
            {
                return null;
            }

            var options =
                new FindOneAndUpdateOptions<
                    EquipmentRequest,
                    EquipmentRequest
                >
                {
                    ReturnDocument =
                        ReturnDocument.After
                };

            return await _equipmentRequests
                .FindOneAndUpdateAsync(
                    request =>
                        request.Id ==
                        id,

                    update,

                    options
                );
        }
    }
}