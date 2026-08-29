using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SmartOffice.AssetService.Data;
using SmartOffice.AssetService.Dtos;
using SmartOffice.AssetService.Models;

namespace SmartOffice.AssetService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssetsController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public AssetsController(
            MongoDbService mongoDbService
        )
        {
            _mongoDbService =
                mongoDbService;
        }

        // =========================================
        // GET ALL ASSETS
        // =========================================

        [HttpGet]
        public async Task<ActionResult<List<Asset>>>
            GetAssets()
        {
            var assets =
                await _mongoDbService
                    .GetAllAsync();

            return Ok(assets);
        }

        // =========================================
        // CREATE ASSET
        // ADMIN ONLY
        // =========================================

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Asset>>
            CreateAsset(
                Asset asset
            )
        {
            if (
                string.IsNullOrWhiteSpace(
                    asset.Name
                ) ||
                string.IsNullOrWhiteSpace(
                    asset.Type
                )
            )
            {
                return BadRequest(
                    "Name and type are required."
                );
            }

            if (
                asset.Location != "Floor 15" &&
                asset.Location != "Floor 16"
            )
            {
                return BadRequest(
                    "Floor must be Floor 15 or Floor 16."
                );
            }

            var allowedTypes =
                new[]
                {
                    "Desk",
                    "Room",
                    "Equipment",
                    "Other"
                };

            if (
                !allowedTypes.Contains(
                    asset.Type
                )
            )
            {
                return BadRequest(
                    "Invalid resource type."
                );
            }

            /*
                Meeting Room availability is
                calculated automatically from
                reservations.

                A new room always starts Available.
            */

            if (asset.Type == "Room")
            {
                asset.Status =
                    "Available";
            }
            else
            {
                var allowedStatuses =
                    new[]
                    {
                        "Available",
                        "In Use",
                        "Maintenance"
                    };

                if (
                    !allowedStatuses.Contains(
                        asset.Status
                    )
                )
                {
                    return BadRequest(
                        "Invalid resource status."
                    );
                }
            }

            var createdAsset =
                await _mongoDbService
                    .CreateAsync(asset);

            return Created(
                $"/api/assets/{createdAsset.Id}",
                createdAsset
            );
        }

        // =========================================
        // UPDATE ASSET
        // ADMIN ONLY
        // =========================================

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Asset>>
            UpdateAsset(
                string id,
                UpdateAssetRequest request
            )
        {
            var asset =
                await _mongoDbService
                    .GetByIdAsync(id);

            if (asset == null)
            {
                return NotFound(
                    "Resource not found."
                );
            }

            // -------------------------------------
            // FLOOR VALIDATION
            // -------------------------------------

            if (
                request.Location != "Floor 15" &&
                request.Location != "Floor 16"
            )
            {
                return BadRequest(
                    "Floor must be Floor 15 or Floor 16."
                );
            }

            // -------------------------------------
            // MEETING ROOM
            // -------------------------------------

            if (asset.Type == "Room")
            {
                /*
                    Admin may only manually select:

                    Available
                    Maintenance

                    In Use comes from active bookings.
                */

                if (
                    request.Status != "Available" &&
                    request.Status != "Maintenance"
                )
                {
                    return BadRequest(
                        "Meeting room status must be Available or Maintenance."
                    );
                }

                /*
                    Important business rule:

                    A room cannot be moved to
                    Maintenance while it still has an
                    active or upcoming reservation.

                    This prevents us from silently
                    breaking users' existing bookings.
                */

                if (
                    request.Status == "Maintenance" &&
                    asset.Status != "Maintenance"
                )
                {
                    var reservations =
                        await _mongoDbService
                            .GetActiveOrFutureReservationsAsync(
                                id
                            );

                    if (reservations.Count > 0)
                    {
                        var nextReservation =
                            reservations.First();

                        return Conflict(
                            new
                            {
                                message =
                                    "This room has active or upcoming reservations. Cancel them before placing the room under maintenance.",

                                reservationCount =
                                    reservations.Count,

                                nextReservation =
                                    new
                                    {
                                        nextReservation.Id,

                                        nextReservation.StartTimeUtc,

                                        nextReservation.EndTimeUtc,

                                        nextReservation.BookedBy
                                    }
                            }
                        );
                    }
                }
            }

            // -------------------------------------
            // OTHER RESOURCES
            // -------------------------------------

            else
            {
                var allowedStatuses =
                    new[]
                    {
                        "Available",
                        "In Use",
                        "Maintenance"
                    };

                if (
                    !allowedStatuses.Contains(
                        request.Status
                    )
                )
                {
                    return BadRequest(
                        "Invalid resource status."
                    );
                }
            }

            // -------------------------------------
            // UPDATE
            // -------------------------------------

            var updatedAsset =
                await _mongoDbService
                    .UpdateAssetAsync(
                        id,
                        request.Location,
                        request.Status
                    );

            if (updatedAsset == null)
            {
                return NotFound(
                    "Resource not found."
                );
            }

            return Ok(updatedAsset);
        }

        // =========================================
        // DELETE ASSET
        // ADMIN ONLY
        // =========================================

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            DeleteAsset(
                string id
            )
        {
            if (
                string.IsNullOrWhiteSpace(
                    id
                )
            )
            {
                return BadRequest(
                    "Asset id is required."
                );
            }

            var asset =
                await _mongoDbService
                    .GetByIdAsync(id);

            if (asset == null)
            {
                return NotFound(
                    "Asset not found."
                );
            }

            /*
                Same protection applies to deleting
                a meeting room.

                We should not delete Butterfly while
                people still have bookings for it.
            */

            if (
                asset.Type == "Room"
            )
            {
                var hasReservations =
                    await _mongoDbService
                        .HasActiveOrFutureReservationsAsync(
                            id
                        );

                if (hasReservations)
                {
                    return Conflict(
                        "This room has active or upcoming reservations. Cancel them before deleting the room."
                    );
                }
            }

            var deleted =
                await _mongoDbService
                    .DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(
                    "Asset not found."
                );
            }

            return NoContent();
        }
    }
}