using System.Security.Claims;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using MongoDB.Bson;
using MongoDB.Driver;

using SmartOffice.AssetService.Controllers;
using SmartOffice.AssetService.Data;
using SmartOffice.AssetService.Dtos;
using SmartOffice.AssetService.Models;

namespace SmartOffice.AssetService.Tests.Controllers
{
    public class LockersControllerTests
    {
        // =========================================
        // MEMBER - REQUEST LOCKER
        // =========================================

        [Fact]
        public async Task RequestLocker_AvailableLocker_CreatesPendingRequest()
        {
            await using var environment =
                CreateEnvironment();

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var result =
                await controller
                    .RequestLocker(
                        locker.Id!
                    );

            var createdResult =
                Assert.IsType<CreatedResult>(
                    result.Result
                );

            var request =
                Assert.IsType<LockerRequest>(
                    createdResult.Value
                );

            Assert.Equal(
                locker.Id,
                request.LockerId
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
                await environment.Service
                    .GetActiveLockerRequestForUserAsync(
                        "member-1"
                    );

            Assert.NotNull(
                storedRequest
            );

            Assert.Equal(
                locker.Id,
                storedRequest.LockerId
            );
        }

        // =========================================
        // ONE ACTIVE LOCKER PER USER
        // =========================================

        [Fact]
        public async Task RequestLocker_UserAlreadyHasActiveRequest_ReturnsConflict()
        {
            await using var environment =
                CreateEnvironment();

            var firstLocker =
                await CreateLockerAsync(
                    environment.Service,
                    name: "L15-001"
                );

            var secondLocker =
                await CreateLockerAsync(
                    environment.Service,
                    name: "L15-002"
                );

            await CreateLockerRequestAsync(
                environment.Service,
                firstLocker,
                userId: "member-1",
                userName: "Lior Test"
            );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var result =
                await controller
                    .RequestLocker(
                        secondLocker.Id!
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var activeRequest =
                await environment.Service
                    .GetActiveLockerRequestForUserAsync(
                        "member-1"
                    );

            Assert.NotNull(
                activeRequest
            );

            Assert.Equal(
                firstLocker.Id,
                activeRequest.LockerId
            );
        }

        // =========================================
        // ONE ACTIVE REQUEST PER LOCKER
        // =========================================

        [Fact]
        public async Task RequestLocker_LockerAlreadyHasActiveRequest_ReturnsConflict()
        {
            await using var environment =
                CreateEnvironment();

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            await CreateLockerRequestAsync(
                environment.Service,
                locker,
                userId: "member-1",
                userName: "First User"
            );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "member-2",
                    userName: "Second User",
                    role: "Member"
                );

            var result =
                await controller
                    .RequestLocker(
                        locker.Id!
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var activeRequest =
                await environment.Service
                    .GetActiveLockerRequestForLockerAsync(
                        locker.Id!
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
        // UNAVAILABLE LOCKER
        // =========================================

        [Fact]
        public async Task RequestLocker_UnavailableLocker_ReturnsConflict()
        {
            await using var environment =
                CreateEnvironment();

            var locker =
                await CreateLockerAsync(
                    environment.Service,
                    status: "Maintenance"
                );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var result =
                await controller
                    .RequestLocker(
                        locker.Id!
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var activeRequest =
                await environment.Service
                    .GetActiveLockerRequestForLockerAsync(
                        locker.Id!
                    );

            Assert.Null(
                activeRequest
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

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            var request =
                await CreateLockerRequestAsync(
                    environment.Service,
                    locker,
                    userId: "member-1",
                    userName: "Lior Test"
                );

            var controller =
                CreateController(
                    environment.Service,
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
                Assert.IsType<LockerRequest>(
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
                await environment.Service
                    .GetActiveLockerRequestForUserAsync(
                        "member-1"
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

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            var request =
                await CreateLockerRequestAsync(
                    environment.Service,
                    locker,
                    userId: "member-1",
                    userName: "First User"
                );

            var controller =
                CreateController(
                    environment.Service,
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
                await environment.Service
                    .GetLockerRequestByIdAsync(
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

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            var request =
                await CreateLockerRequestAsync(
                    environment.Service,
                    locker,
                    userId: "member-1",
                    userName: "Member User"
                );

            var controller =
                CreateController(
                    environment.Service,
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
                Assert.IsType<LockerRequest>(
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
        // ADMIN - REJECT
        // =========================================

        [Fact]
        public async Task RejectRequest_PendingRequest_RejectsAndDeactivates()
        {
            await using var environment =
                CreateEnvironment();

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            var request =
                await CreateLockerRequestAsync(
                    environment.Service,
                    locker,
                    userId: "member-1",
                    userName: "Member User"
                );

            var controller =
                CreateController(
                    environment.Service,
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
                Assert.IsType<LockerRequest>(
                    okResult.Value
                );

            Assert.Equal(
                "Rejected",
                rejected.Status
            );

            Assert.False(
                rejected.IsActive
            );
        }

        // =========================================
        // ADMIN - COLLECT KEY
        // =========================================

        [Fact]
        public async Task MarkKeyCollected_ApprovedRequest_MarksCollected()
        {
            await using var environment =
                CreateEnvironment();

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            var request =
                await CreateLockerRequestAsync(
                    environment.Service,
                    locker,
                    userId: "member-1",
                    userName: "Member User"
                );

            await environment.Service
                .ApproveLockerRequestAsync(
                    request.Id!,
                    "admin-1",
                    "Admin User"
                );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "admin-1",
                    userName: "Admin User",
                    role: "Admin"
                );

            var result =
                await controller
                    .MarkKeyCollected(
                        request.Id!
                    );

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var collected =
                Assert.IsType<LockerRequest>(
                    okResult.Value
                );

            Assert.Equal(
                "Collected",
                collected.Status
            );

            Assert.True(
                collected.IsActive
            );
        }

        // =========================================
        // ADMIN - RETURN KEY
        // =========================================

        [Fact]
        public async Task MarkKeyReturned_CollectedRequest_MarksReturnedAndInactive()
        {
            await using var environment =
                CreateEnvironment();

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            var request =
                await CreateLockerRequestAsync(
                    environment.Service,
                    locker,
                    userId: "member-1",
                    userName: "Member User"
                );

            await environment.Service
                .ApproveLockerRequestAsync(
                    request.Id!,
                    "admin-1",
                    "Admin User"
                );

            await environment.Service
                .MarkLockerKeyCollectedAsync(
                    request.Id!
                );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "admin-1",
                    userName: "Admin User",
                    role: "Admin"
                );

            var result =
                await controller
                    .MarkKeyReturned(
                        request.Id!
                    );

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var returned =
                Assert.IsType<LockerRequest>(
                    okResult.Value
                );

            Assert.Equal(
                "Returned",
                returned.Status
            );

            Assert.False(
                returned.IsActive
            );

            var activeRequest =
                await environment.Service
                    .GetActiveLockerRequestForLockerAsync(
                        locker.Id!
                    );

            Assert.Null(
                activeRequest
            );
        }

        // =========================================
        // AVAILABILITY - ACTIVE REQUEST
        // =========================================

        [Fact]
        public async Task UpdateLockerAvailability_ActiveRequest_ReturnsConflict()
        {
            await using var environment =
                CreateEnvironment();

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            await CreateLockerRequestAsync(
                environment.Service,
                locker,
                userId: "member-1",
                userName: "Member User"
            );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "admin-1",
                    userName: "Admin User",
                    role: "Admin"
                );

            var request =
                new UpdateLockerAvailabilityRequest
                {
                    Status =
                        "Maintenance"
                };

            var result =
                await controller
                    .UpdateLockerAvailability(
                        locker.Id!,
                        request
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var storedLocker =
                await environment.Service
                    .GetLockerByIdAsync(
                        locker.Id!
                    );

            Assert.NotNull(
                storedLocker
            );

            Assert.Equal(
                "Available",
                storedLocker.Status
            );
        }

        // =========================================
        // AVAILABILITY - SUCCESS
        // =========================================

        [Fact]
        public async Task UpdateLockerAvailability_NoActiveRequest_UpdatesStatus()
        {
            await using var environment =
                CreateEnvironment();

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "admin-1",
                    userName: "Admin User",
                    role: "Admin"
                );

            var request =
                new UpdateLockerAvailabilityRequest
                {
                    Status =
                        "Maintenance"
                };

            var result =
                await controller
                    .UpdateLockerAvailability(
                        locker.Id!,
                        request
                    );

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var updated =
                Assert.IsType<Asset>(
                    okResult.Value
                );

            Assert.Equal(
                "Maintenance",
                updated.Status
            );

            var storedLocker =
                await environment.Service
                    .GetLockerByIdAsync(
                        locker.Id!
                    );

            Assert.NotNull(
                storedLocker
            );

            Assert.Equal(
                "Maintenance",
                storedLocker.Status
            );
        }

        // =========================================
        // AVAILABILITY - INVALID STATUS
        // =========================================

        [Fact]
        public async Task UpdateLockerAvailability_InvalidStatus_ReturnsBadRequest()
        {
            await using var environment =
                CreateEnvironment();

            var locker =
                await CreateLockerAsync(
                    environment.Service
                );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "admin-1",
                    userName: "Admin User",
                    role: "Admin"
                );

            var request =
                new UpdateLockerAvailabilityRequest
                {
                    Status =
                        "Broken"
                };

            var result =
                await controller
                    .UpdateLockerAvailability(
                        locker.Id!,
                        request
                    );

            Assert.IsType<BadRequestObjectResult>(
                result.Result
            );

            var storedLocker =
                await environment.Service
                    .GetLockerByIdAsync(
                        locker.Id!
                    );

            Assert.NotNull(
                storedLocker
            );

            Assert.Equal(
                "Available",
                storedLocker.Status
            );
        }

        // =========================================
        // HELPERS - LOCKER
        // =========================================

        private static async Task<Asset>
            CreateLockerAsync(
                MongoDbService service,
                string name = "L15-001",
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
                            "Shared Resource",

                        Category =
                            "Locker",

                        Location =
                            "Floor 15",

                        Description =
                            "Test employee locker.",

                        Features =
                            new List<string>
                            {
                                "Secure Storage",
                                "Key Required"
                            },

                        Status =
                            status
                    }
                );
        }

        // =========================================
        // HELPERS - LOCKER REQUEST
        // =========================================

        private static async Task<LockerRequest>
            CreateLockerRequestAsync(
                MongoDbService service,
                Asset locker,
                string userId,
                string userName
            )
        {
            return await service
                .CreateLockerRequestAsync(
                    new LockerRequest
                    {
                        Id =
                            ObjectId
                                .GenerateNewId()
                                .ToString(),

                        LockerId =
                            locker.Id!,

                        LockerName =
                            locker.Name,

                        Floor =
                            locker.Location,

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
        // HELPERS - AUTHENTICATED CONTROLLER
        // =========================================

        private static LockersController
            CreateController(
                MongoDbService service,
                string userId,
                string userName,
                string role
            )
        {
            var controller =
                new LockersController(
                    service
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

            public MongoDbService Service
            {
                get;
            }

            public MongoTestEnvironment()
            {
                DatabaseName =
                    $"SmartOfficeLockerTests_{Guid.NewGuid():N}";

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

                var configuration =
                    new ConfigurationBuilder()
                        .AddInMemoryCollection(
                            configurationValues
                        )
                        .Build();

                _client =
                    new MongoClient(
                        ConnectionString
                    );

                Service =
                    new MongoDbService(
                        configuration
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