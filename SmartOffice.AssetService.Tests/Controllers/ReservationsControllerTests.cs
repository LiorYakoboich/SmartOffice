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
    public class ReservationsControllerTests
    {
        // =========================================
        // CREATE - SUCCESS
        // =========================================

        [Fact]
        public async Task CreateReservation_ValidRequest_CreatesReservation()
        {
            await using var environment =
                CreateEnvironment();

            var room =
                await CreateRoomAsync(
                    environment.Service
                );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var start =
                DateTime.UtcNow
                    .AddHours(2);

            var end =
                start.AddHours(1);

            var request =
                new CreateReservationRequest
                {
                    AssetId =
                        room.Id!,

                    StartTimeUtc =
                        start,

                    EndTimeUtc =
                        end
                };

            var result =
                await controller
                    .CreateReservation(
                        request
                    );

            var createdResult =
                Assert.IsType<CreatedResult>(
                    result.Result
                );

            var reservation =
                Assert.IsType<Reservation>(
                    createdResult.Value
                );

            Assert.Equal(
                room.Id,
                reservation.AssetId
            );

            Assert.Equal(
                room.Name,
                reservation.RoomName
            );

            Assert.Equal(
                room.Location,
                reservation.Floor
            );

            Assert.Equal(
                "member-1",
                reservation.BookedByUserId
            );

            Assert.Equal(
                "Lior Test",
                reservation.BookedBy
            );

            var storedReservations =
                await environment.Service
                    .GetReservationsForAssetAsync(
                        room.Id!
                    );

            var storedReservation =
                Assert.Single(
                    storedReservations
                );

            Assert.Equal(
                reservation.Id,
                storedReservation.Id
            );
        }

        // =========================================
        // DOUBLE BOOKING
        // =========================================

        [Fact]
        public async Task CreateReservation_OverlappingReservation_ReturnsConflict()
        {
            await using var environment =
                CreateEnvironment();

            var room =
                await CreateRoomAsync(
                    environment.Service
                );

            var existingStart =
                DateTime.UtcNow
                    .AddHours(3);

            var existingEnd =
                existingStart
                    .AddHours(1);

            await environment.Service
                .CreateReservationAsync(
                    new Reservation
                    {
                        Id =
                            ObjectId
                                .GenerateNewId()
                                .ToString(),

                        AssetId =
                            room.Id!,

                        RoomName =
                            room.Name,

                        Floor =
                            room.Location,

                        StartTimeUtc =
                            existingStart,

                        EndTimeUtc =
                            existingEnd,

                        BookedByUserId =
                            "member-1",

                        BookedBy =
                            "Existing User"
                    }
                );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "member-2",
                    userName: "Second User",
                    role: "Member"
                );

            /*
                Existing booking:
                15:00 - 16:00

                New booking:
                15:30 - 16:30

                These overlap.
            */

            var request =
                new CreateReservationRequest
                {
                    AssetId =
                        room.Id!,

                    StartTimeUtc =
                        existingStart
                            .AddMinutes(30),

                    EndTimeUtc =
                        existingEnd
                            .AddMinutes(30)
                };

            var result =
                await controller
                    .CreateReservation(
                        request
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var reservations =
                await environment.Service
                    .GetReservationsForAssetAsync(
                        room.Id!
                    );

            Assert.Single(
                reservations
            );
        }

        // =========================================
        // BACK-TO-BACK BOOKINGS
        // =========================================

        [Fact]
        public async Task CreateReservation_StartsWhenPreviousEnds_IsAllowed()
        {
            await using var environment =
                CreateEnvironment();

            var room =
                await CreateRoomAsync(
                    environment.Service
                );

            var existingStart =
                DateTime.UtcNow
                    .AddHours(3);

            var existingEnd =
                existingStart
                    .AddHours(1);

            await environment.Service
                .CreateReservationAsync(
                    new Reservation
                    {
                        Id =
                            ObjectId
                                .GenerateNewId()
                                .ToString(),

                        AssetId =
                            room.Id!,

                        RoomName =
                            room.Name,

                        Floor =
                            room.Location,

                        StartTimeUtc =
                            existingStart,

                        EndTimeUtc =
                            existingEnd,

                        BookedByUserId =
                            "member-1",

                        BookedBy =
                            "First User"
                    }
                );

            var controller =
                CreateController(
                    environment.Service,
                    userId: "member-2",
                    userName: "Second User",
                    role: "Member"
                );

            /*
                First booking:
                15:00 - 16:00

                Second booking:
                16:00 - 17:00

                They touch but do not overlap.
            */

            var request =
                new CreateReservationRequest
                {
                    AssetId =
                        room.Id!,

                    StartTimeUtc =
                        existingEnd,

                    EndTimeUtc =
                        existingEnd
                            .AddHours(1)
                };

            var result =
                await controller
                    .CreateReservation(
                        request
                    );

            Assert.IsType<CreatedResult>(
                result.Result
            );

            var reservations =
                await environment.Service
                    .GetReservationsForAssetAsync(
                        room.Id!
                    );

            Assert.Equal(
                2,
                reservations.Count
            );
        }

        // =========================================
        // MAINTENANCE
        // =========================================

        [Fact]
        public async Task CreateReservation_RoomInMaintenance_ReturnsConflict()
        {
            await using var environment =
                CreateEnvironment();

            var room =
                await CreateRoomAsync(
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

            var start =
                DateTime.UtcNow
                    .AddHours(2);

            var request =
                new CreateReservationRequest
                {
                    AssetId =
                        room.Id!,

                    StartTimeUtc =
                        start,

                    EndTimeUtc =
                        start.AddHours(1)
                };

            var result =
                await controller
                    .CreateReservation(
                        request
                    );

            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

            var reservations =
                await environment.Service
                    .GetReservationsForAssetAsync(
                        room.Id!
                    );

            Assert.Empty(
                reservations
            );
        }

        // =========================================
        // NON-ROOM ASSET
        // =========================================

        [Fact]
        public async Task CreateReservation_NonRoomAsset_ReturnsBadRequest()
        {
            await using var environment =
                CreateEnvironment();

            var desk =
                await environment.Service
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
                    environment.Service,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var start =
                DateTime.UtcNow
                    .AddHours(2);

            var request =
                new CreateReservationRequest
                {
                    AssetId =
                        desk.Id!,

                    StartTimeUtc =
                        start,

                    EndTimeUtc =
                        start.AddHours(1)
                };

            var result =
                await controller
                    .CreateReservation(
                        request
                    );

            Assert.IsType<BadRequestObjectResult>(
                result.Result
            );
        }

        // =========================================
        // INVALID TIME RANGE
        // =========================================

        [Fact]
        public async Task CreateReservation_EndBeforeStart_ReturnsBadRequest()
        {
            await using var environment =
                CreateEnvironment();

            var controller =
                CreateController(
                    environment.Service,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var start =
                DateTime.UtcNow
                    .AddHours(2);

            var request =
                new CreateReservationRequest
                {
                    AssetId =
                        ObjectId
                            .GenerateNewId()
                            .ToString(),

                    StartTimeUtc =
                        start,

                    EndTimeUtc =
                        start.AddMinutes(-30)
                };

            var result =
                await controller
                    .CreateReservation(
                        request
                    );

            Assert.IsType<BadRequestObjectResult>(
                result.Result
            );
        }

        // =========================================
        // PAST RESERVATION
        // =========================================

        [Fact]
        public async Task CreateReservation_StartsInPast_ReturnsBadRequest()
        {
            await using var environment =
                CreateEnvironment();

            var controller =
                CreateController(
                    environment.Service,
                    userId: "member-1",
                    userName: "Lior Test",
                    role: "Member"
                );

            var start =
                DateTime.UtcNow
                    .AddHours(-2);

            var request =
                new CreateReservationRequest
                {
                    AssetId =
                        ObjectId
                            .GenerateNewId()
                            .ToString(),

                    StartTimeUtc =
                        start,

                    EndTimeUtc =
                        start.AddHours(1)
                };

            var result =
                await controller
                    .CreateReservation(
                        request
                    );

            Assert.IsType<BadRequestObjectResult>(
                result.Result
            );
        }

        // =========================================
        // MEMBER CANNOT DELETE ANOTHER USER'S BOOKING
        // =========================================

        [Fact]
        public async Task DeleteReservation_MemberIsNotOwner_ReturnsForbid()
        {
            await using var environment =
                CreateEnvironment();

            var room =
                await CreateRoomAsync(
                    environment.Service
                );

            var reservation =
                await CreateReservationAsync(
                    environment.Service,
                    room,
                    userId:
                        "member-1",
                    userName:
                        "First User"
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
                    .DeleteReservation(
                        reservation.Id!
                    );

            Assert.IsType<ForbidResult>(
                result
            );

            var storedReservation =
                await environment.Service
                    .GetReservationByIdAsync(
                        reservation.Id!
                    );

            Assert.NotNull(
                storedReservation
            );
        }

        // =========================================
        // MEMBER CAN DELETE OWN BOOKING
        // =========================================

        [Fact]
        public async Task DeleteReservation_MemberOwnsReservation_DeletesReservation()
        {
            await using var environment =
                CreateEnvironment();

            var room =
                await CreateRoomAsync(
                    environment.Service
                );

            var reservation =
                await CreateReservationAsync(
                    environment.Service,
                    room,
                    userId:
                        "member-1",
                    userName:
                        "Lior Test"
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
                    .DeleteReservation(
                        reservation.Id!
                    );

            Assert.IsType<NoContentResult>(
                result
            );

            var storedReservation =
                await environment.Service
                    .GetReservationByIdAsync(
                        reservation.Id!
                    );

            Assert.Null(
                storedReservation
            );
        }

        // =========================================
        // ADMIN CAN DELETE ANY BOOKING
        // =========================================

        [Fact]
        public async Task DeleteReservation_AdminDeletesAnotherUsersReservation_Succeeds()
        {
            await using var environment =
                CreateEnvironment();

            var room =
                await CreateRoomAsync(
                    environment.Service
                );

            var reservation =
                await CreateReservationAsync(
                    environment.Service,
                    room,
                    userId:
                        "member-1",
                    userName:
                        "Member User"
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
                    .DeleteReservation(
                        reservation.Id!
                    );

            Assert.IsType<NoContentResult>(
                result
            );

            var storedReservation =
                await environment.Service
                    .GetReservationByIdAsync(
                        reservation.Id!
                    );

            Assert.Null(
                storedReservation
            );
        }

        // =========================================
        // MY RESERVATIONS
        // =========================================

        [Fact]
        public async Task GetMyReservations_ReturnsOnlyCurrentUsersReservations()
        {
            await using var environment =
                CreateEnvironment();

            var room =
                await CreateRoomAsync(
                    environment.Service
                );

            await CreateReservationAsync(
                environment.Service,
                room,
                userId:
                    "member-1",
                userName:
                    "Lior Test",
                hourOffset:
                    2
            );

            await CreateReservationAsync(
                environment.Service,
                room,
                userId:
                    "member-2",
                userName:
                    "Other User",
                hourOffset:
                    5
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
                    .GetMyReservations();

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result.Result
                );

            var reservations =
                Assert.IsAssignableFrom<
                    List<Reservation>
                >(
                    okResult.Value
                );

            var reservation =
                Assert.Single(
                    reservations
                );

            Assert.Equal(
                "member-1",
                reservation.BookedByUserId
            );
        }

        // =========================================
        // HELPERS - ROOM
        // =========================================

        private static async Task<Asset>
            CreateRoomAsync(
                MongoDbService service,
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
                            "Butterfly",

                        Type =
                            "Room",

                        Category =
                            "Meeting Room",

                        Location =
                            "Floor 15",

                        Description =
                            "Test meeting room.",

                        Features =
                            new List<string>
                            {
                                "Display",
                                "Video Conference"
                            },

                        Status =
                            status
                    }
                );
        }

        // =========================================
        // HELPERS - RESERVATION
        // =========================================

        private static async Task<Reservation>
            CreateReservationAsync(
                MongoDbService service,
                Asset room,
                string userId,
                string userName,
                int hourOffset = 2
            )
        {
            var start =
                DateTime.UtcNow
                    .AddHours(
                        hourOffset
                    );

            return await service
                .CreateReservationAsync(
                    new Reservation
                    {
                        Id =
                            ObjectId
                                .GenerateNewId()
                                .ToString(),

                        AssetId =
                            room.Id!,

                        RoomName =
                            room.Name,

                        Floor =
                            room.Location,

                        StartTimeUtc =
                            start,

                        EndTimeUtc =
                            start.AddHours(1),

                        BookedByUserId =
                            userId,

                        BookedBy =
                            userName
                    }
                );
        }

        // =========================================
        // HELPERS - AUTHENTICATED CONTROLLER
        // =========================================

        private static ReservationsController
            CreateController(
                MongoDbService service,
                string userId,
                string userName,
                string role
            )
        {
            var controller =
                new ReservationsController(
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
                    $"SmartOfficeAssetTests_{Guid.NewGuid():N}";

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