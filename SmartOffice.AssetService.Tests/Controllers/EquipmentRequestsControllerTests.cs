using System.Security.Claims;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using MongoDB.Bson;
using MongoDB.Driver;

using SmartOffice.AssetService.Controllers;
using SmartOffice.AssetService.Data;
using SmartOffice.AssetService.Models;

namespace SmartOffice.AssetService.Tests.Controllers
{
    public class EquipmentRequestsControllerTests
    {
        // =========================================
        // MEMBER - REQUEST EQUIPMENT
        // =========================================

        [Fact]
        public async Task RequestEquipment_AvailableEquipment_CreatesPendingRequest()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService
                );

            var controller =
                CreateController(
                    environment,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var result =
                await controller
                    .RequestEquipment(
                        equipment.Id!
                    );

            var createdResult =
                Assert.IsType<CreatedResult>(
                    result.Result
                );

            var request =
                Assert.IsType<EquipmentRequest>(
                    createdResult.Value
                );

            Assert.Equal(
                equipment.Id,
                request.AssetId
            );

            Assert.Equal(
                equipment.Name,
                request.AssetName
            );

            Assert.Equal(
                "member-1",
                request.RequestedByUserId
            );

            Assert.Equal(
                "Lior Test",
                request.RequestedBy
            );

            Assert.Equal(
                "Pending",
                request.Status
            );

            Assert.True(
                request.IsActive
            );

            var storedRequest =
                await environment
                    .EquipmentRequestService
                    .GetActiveRequestForAssetAsync(
                        equipment.Id!
                    );

            Assert.NotNull(
                storedRequest
            );

            Assert.Equal(
                request.Id,
                storedRequest.Id
            );
        }

        // =========================================
        // ONLY EQUIPMENT CAN BE REQUESTED
        // =========================================

        [Fact]
        public async Task RequestEquipment_AssetIsNotEquipment_ReturnsBadRequest()
        {
            await using var environment =
                CreateEnvironment();

            var desk =
                await environment
                    .MongoDbService
                    .CreateAsync(
                        new Asset
                        {
                            Id =
                                ObjectId
                                    .GenerateNewId()
                                    .ToString(),

                            Name =
                                "Desk 15-A01",

                            Type =
                                "Desk",

                            Category =
                                "Standing Desk",

                            Location =
                                "Floor 15",

                            Status =
                                "Available"
                        }
                    );

            var controller =
                CreateController(
                    environment,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var result =
                await controller
                    .RequestEquipment(
                        desk.Id!
                    );

            Assert.IsType<BadRequestObjectResult>(
                result.Result
            );

            var activeRequest =
                await environment
                    .EquipmentRequestService
                    .GetActiveRequestForAssetAsync(
                        desk.Id!
                    );

            Assert.Null(
                activeRequest
            );
        }

        // =========================================
        // UNAVAILABLE EQUIPMENT
        // =========================================

        [Fact]
        public async Task RequestEquipment_EquipmentInMaintenance_ReturnsConflict()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService,
                    status: "Maintenance"
                );

            var controller =
                CreateController(
                    environment,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var result =
                await controller
                    .RequestEquipment(
                        equipment.Id!
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var activeRequest =
                await environment
                    .EquipmentRequestService
                    .GetActiveRequestForAssetAsync(
                        equipment.Id!
                    );

            Assert.Null(
                activeRequest
            );
        }

        // =========================================
        // ONE ACTIVE WORKFLOW PER EQUIPMENT
        // =========================================

        [Fact]
        public async Task RequestEquipment_AlreadyHasActiveRequest_ReturnsConflict()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService
                );

            await CreateEquipmentRequestAsync(
                environment.EquipmentRequestService,
                equipment,
                userId: "member-1",
                userName: "First User"
            );

            var controller =
                CreateController(
                    environment,
                    userId: "member-2",
                    userName: "Second User",
                    role: "Member"
                );

            var result =
                await controller
                    .RequestEquipment(
                        equipment.Id!
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var activeRequest =
                await environment
                    .EquipmentRequestService
                    .GetActiveRequestForAssetAsync(
                        equipment.Id!
                    );

            Assert.NotNull(
                activeRequest
            );

            Assert.Equal(
                "member-1",
                activeRequest.RequestedByUserId
            );
        }

        // =========================================
        // MEMBER - CANCEL OWN REQUEST
        // =========================================

        [Fact]
        public async Task CancelRequest_Owner_CancelsRequest()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService
                );

            var request =
                await CreateEquipmentRequestAsync(
                    environment.EquipmentRequestService,
                    equipment,
                    userId: "member-1",
                    userName: "Lior Test"
                );

            var controller =
                CreateController(
                    environment,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var result =
                await controller
                    .CancelRequest(
                        request.Id!
                    );

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var cancelled =
                Assert.IsType<EquipmentRequest>(
                    okResult.Value
                );

            Assert.Equal(
                "Cancelled",
                cancelled.Status
            );

            Assert.False(
                cancelled.IsActive
            );

            var activeRequest =
                await environment
                    .EquipmentRequestService
                    .GetActiveRequestForAssetAsync(
                        equipment.Id!
                    );

            Assert.Null(
                activeRequest
            );
        }

        // =========================================
        // MEMBER - CANNOT CANCEL OTHER USER
        // =========================================

        [Fact]
        public async Task CancelRequest_NotOwner_ReturnsForbid()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService
                );

            var request =
                await CreateEquipmentRequestAsync(
                    environment.EquipmentRequestService,
                    equipment,
                    userId: "member-1",
                    userName: "First User"
                );

            var controller =
                CreateController(
                    environment,
                    userId: "member-2",
                    userName: "Second User",
                    role: "Member"
                );

            var result =
                await controller
                    .CancelRequest(
                        request.Id!
                    );

            Assert.IsType<ForbidResult>(
                result.Result
            );

            var storedRequest =
                await environment
                    .EquipmentRequestService
                    .GetByIdAsync(
                        request.Id!
                    );

            Assert.NotNull(
                storedRequest
            );

            Assert.Equal(
                "Pending",
                storedRequest.Status
            );

            Assert.True(
                storedRequest.IsActive
            );
        }

        // =========================================
        // ADMIN - APPROVE
        // =========================================

        [Fact]
        public async Task ApproveRequest_PendingRequest_ApprovesRequest()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService
                );

            var request =
                await CreateEquipmentRequestAsync(
                    environment.EquipmentRequestService,
                    equipment,
                    userId: "member-1",
                    userName: "Member User"
                );

            var controller =
                CreateController(
                    environment,
                    userId: "admin-1",
                    userName: "Admin User",
                    role: "Admin"
                );

            var result =
                await controller
                    .ApproveRequest(
                        request.Id!
                    );

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var approved =
                Assert.IsType<EquipmentRequest>(
                    okResult.Value
                );

            Assert.Equal(
                "Approved",
                approved.Status
            );

            Assert.True(
                approved.IsActive
            );

            Assert.Equal(
                "admin-1",
                approved.ReviewedByUserId
            );

            Assert.Equal(
                "Admin User",
                approved.ReviewedBy
            );
        }

        // =========================================
        // ADMIN - APPROVE UNAVAILABLE EQUIPMENT
        // =========================================

        [Fact]
        public async Task ApproveRequest_EquipmentNoLongerAvailable_ReturnsConflict()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService
                );

            var request =
                await CreateEquipmentRequestAsync(
                    environment.EquipmentRequestService,
                    equipment,
                    userId: "member-1",
                    userName: "Member User"
                );

            await environment
                .MongoDbService
                .UpdateAssetAsync(
                    equipment.Id!,
                    equipment.Location,
                    "Maintenance"
                );

            var controller =
                CreateController(
                    environment,
                    userId: "admin-1",
                    userName: "Admin User",
                    role: "Admin"
                );

            var result =
                await controller
                    .ApproveRequest(
                        request.Id!
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var storedRequest =
                await environment
                    .EquipmentRequestService
                    .GetByIdAsync(
                        request.Id!
                    );

            Assert.NotNull(
                storedRequest
            );

            Assert.Equal(
                "Pending",
                storedRequest.Status
            );
        }

        // =========================================
        // ADMIN - REJECT
        // =========================================

        [Fact]
        public async Task RejectRequest_PendingRequest_RejectsAndDeactivates()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService
                );

            var request =
                await CreateEquipmentRequestAsync(
                    environment.EquipmentRequestService,
                    equipment,
                    userId: "member-1",
                    userName: "Member User"
                );

            var controller =
                CreateController(
                    environment,
                    userId: "admin-1",
                    userName: "Admin User",
                    role: "Admin"
                );

            var result =
                await controller
                    .RejectRequest(
                        request.Id!
                    );

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var rejected =
                Assert.IsType<EquipmentRequest>(
                    okResult.Value
                );

            Assert.Equal(
                "Rejected",
                rejected.Status
            );

            Assert.False(
                rejected.IsActive
            );

            Assert.Equal(
                "admin-1",
                rejected.ReviewedByUserId
            );
        }

        // =========================================
        // ADMIN - COLLECT
        // =========================================

        [Fact]
        public async Task MarkCollected_ApprovedRequest_MarksEquipmentInUse()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService
                );

            var request =
                await CreateEquipmentRequestAsync(
                    environment.EquipmentRequestService,
                    equipment,
                    userId: "member-1",
                    userName: "Member User"
                );

            await environment
                .EquipmentRequestService
                .ApproveAsync(
                    request.Id!,
                    "admin-1",
                    "Admin User"
                );

            var controller =
                CreateController(
                    environment,
                    userId: "admin-1",
                    userName: "Admin User",
                    role: "Admin"
                );

            var result =
                await controller
                    .MarkCollected(
                        request.Id!
                    );

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var collected =
                Assert.IsType<EquipmentRequest>(
                    okResult.Value
                );

            Assert.Equal(
                "Collected",
                collected.Status
            );

            Assert.True(
                collected.IsActive
            );

            var updatedAsset =
                await environment
                    .MongoDbService
                    .GetByIdAsync(
                        equipment.Id!
                    );

            Assert.NotNull(
                updatedAsset
            );

            Assert.Equal(
                "In Use",
                updatedAsset.Status
            );
        }

        // =========================================
        // MEMBER - COLLECTED ITEM CANNOT BE CANCELLED
        // =========================================

        [Fact]
        public async Task CancelRequest_CollectedEquipment_ReturnsConflict()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService
                );

            var request =
                await CreateEquipmentRequestAsync(
                    environment.EquipmentRequestService,
                    equipment,
                    userId: "member-1",
                    userName: "Member User"
                );

            await environment
                .EquipmentRequestService
                .ApproveAsync(
                    request.Id!,
                    "admin-1",
                    "Admin User"
                );

            await environment
                .EquipmentRequestService
                .MarkCollectedAsync(
                    request.Id!
                );

            var controller =
                CreateController(
                    environment,
                    userId: "member-1",
                    userName: "Member User",
                    role: "Member"
                );

            var result =
                await controller
                    .CancelRequest(
                        request.Id!
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var storedRequest =
                await environment
                    .EquipmentRequestService
                    .GetByIdAsync(
                        request.Id!
                    );

            Assert.NotNull(
                storedRequest
            );

            Assert.Equal(
                "Collected",
                storedRequest.Status
            );

            Assert.True(
                storedRequest.IsActive
            );
        }

        // =========================================
        // ADMIN - RETURN
        // =========================================

        [Fact]
        public async Task MarkReturned_CollectedRequest_ReturnsEquipmentToAvailable()
        {
            await using var environment =
                CreateEnvironment();

            var equipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService
                );

            var request =
                await CreateEquipmentRequestAsync(
                    environment.EquipmentRequestService,
                    equipment,
                    userId: "member-1",
                    userName: "Member User"
                );

            await environment
                .EquipmentRequestService
                .ApproveAsync(
                    request.Id!,
                    "admin-1",
                    "Admin User"
                );

            await environment
                .MongoDbService
                .UpdateAssetAsync(
                    equipment.Id!,
                    equipment.Location,
                    "In Use"
                );

            await environment
                .EquipmentRequestService
                .MarkCollectedAsync(
                    request.Id!
                );

            var controller =
                CreateController(
                    environment,
                    userId: "admin-1",
                    userName: "Admin User",
                    role: "Admin"
                );

            var result =
                await controller
                    .MarkReturned(
                        request.Id!
                    );

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var returned =
                Assert.IsType<EquipmentRequest>(
                    okResult.Value
                );

            Assert.Equal(
                "Returned",
                returned.Status
            );

            Assert.False(
                returned.IsActive
            );

            var updatedAsset =
                await environment
                    .MongoDbService
                    .GetByIdAsync(
                        equipment.Id!
                    );

            Assert.NotNull(
                updatedAsset
            );

            Assert.Equal(
                "Available",
                updatedAsset.Status
            );

            var activeRequest =
                await environment
                    .EquipmentRequestService
                    .GetActiveRequestForAssetAsync(
                        equipment.Id!
                    );

            Assert.Null(
                activeRequest
            );
        }

        // =========================================
        // MEMBER - MY REQUESTS
        // =========================================

        [Fact]
        public async Task GetMyRequests_ReturnsOnlyCurrentUsersRequests()
        {
            await using var environment =
                CreateEnvironment();

            var firstEquipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService,
                    name: "Jabra Evolve2 65"
                );

            var secondEquipment =
                await CreateEquipmentAsync(
                    environment.MongoDbService,
                    name: "Logitech Brio 4K"
                );

            await CreateEquipmentRequestAsync(
                environment.EquipmentRequestService,
                firstEquipment,
                userId: "member-1",
                userName: "First User"
            );

            await CreateEquipmentRequestAsync(
                environment.EquipmentRequestService,
                secondEquipment,
                userId: "member-2",
                userName: "Second User"
            );

            var controller =
                CreateController(
                    environment,
                    userId: "member-1",
                    userName: "First User",
                    role: "Member"
                );

            var result =
                await controller
                    .GetMyRequests();

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var requests =
                Assert.IsAssignableFrom<
                    List<EquipmentRequest>
                >(
                    okResult.Value
                );

            var request =
                Assert.Single(
                    requests
                );

            Assert.Equal(
                "member-1",
                request.RequestedByUserId
            );
        }

        // =========================================
        // HELPERS - EQUIPMENT
        // =========================================

        private static async Task<Asset>
            CreateEquipmentAsync(
                MongoDbService service,
                string name = "Jabra Evolve2 65",
                string status = "Available"
            )
        {
            return await service
                .CreateAsync(
                    new Asset
                    {
                        Id =
                            ObjectId
                                .GenerateNewId()
                                .ToString(),

                        Name =
                            name,

                        Type =
                            "Equipment",

                        Category =
                            "Headset",

                        Location =
                            "Floor 15",

                        Description =
                            "Test equipment.",

                        Features =
                            new List<string>
                            {
                                "USB",
                                "Wireless"
                            },

                        Status =
                            status
                    }
                );
        }

        // =========================================
        // HELPERS - REQUEST
        // =========================================

        private static async Task<EquipmentRequest>
            CreateEquipmentRequestAsync(
                EquipmentRequestService service,
                Asset equipment,
                string userId,
                string userName
            )
        {
            return await service
                .CreateAsync(
                    new EquipmentRequest
                    {
                        Id =
                            ObjectId
                                .GenerateNewId()
                                .ToString(),

                        AssetId =
                            equipment.Id!,

                        AssetName =
                            equipment.Name,

                        Category =
                            equipment.Category,

                        Location =
                            equipment.Location,

                        RequestedByUserId =
                            userId,

                        RequestedBy =
                            userName,

                        Status =
                            "Pending",

                        IsActive =
                            true
                    }
                );
        }

        // =========================================
        // HELPERS - CONTROLLER
        // =========================================

        private static EquipmentRequestsController
            CreateController(
                MongoTestEnvironment environment,
                string userId,
                string userName,
                string role
            )
        {
            var controller =
                new EquipmentRequestsController(
                    environment.MongoDbService,
                    environment.Configuration
                );

            var claims =
                new List<Claim>
                {
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

            var identity =
                new ClaimsIdentity(
                    claims,
                    "TestAuthentication"
                );

            controller.ControllerContext =
                new ControllerContext
                {
                    HttpContext =
                        new DefaultHttpContext
                        {
                            User =
                                new ClaimsPrincipal(
                                    identity
                                )
                        }
                };

            return controller;
        }

        // =========================================
        // HELPERS - TEST DATABASE
        // =========================================

        private static MongoTestEnvironment
            CreateEnvironment()
        {
            return new MongoTestEnvironment();
        }

        private sealed class MongoTestEnvironment :
            IAsyncDisposable
        {
            private const string
                ConnectionString =
                    "mongodb://localhost:27017";

            private readonly MongoClient
                _client;

            public string DatabaseName
            {
                get;
            }

            public IConfiguration Configuration
            {
                get;
            }

            public MongoDbService MongoDbService
            {
                get;
            }

            public EquipmentRequestService
                EquipmentRequestService
            {
                get;
            }

            public MongoTestEnvironment()
            {
                DatabaseName =
                    $"SmartOfficeEquipmentTests_{Guid.NewGuid():N}";

                var configurationValues =
                    new Dictionary<
                        string,
                        string?
                    >
                    {
                        [
                            "MongoDb:ConnectionString"
                        ] =
                            ConnectionString,

                        [
                            "MongoDb:DatabaseName"
                        ] =
                            DatabaseName
                    };

                Configuration =
                    new ConfigurationBuilder()
                        .AddInMemoryCollection(
                            configurationValues
                        )
                        .Build();

                _client =
                    new MongoClient(
                        ConnectionString
                    );

                MongoDbService =
                    new MongoDbService(
                        Configuration
                    );

                EquipmentRequestService =
                    new EquipmentRequestService(
                        Configuration
                    );
            }

            public async ValueTask
                DisposeAsync()
            {
                await _client
                    .DropDatabaseAsync(
                        DatabaseName
                    );
            }
        }
    }
}