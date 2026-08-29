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
            /*
                Portfolio/demo office inventory.

                Existing data is never deleted or replaced.
            */

            await OfficeResourceDemoSeeder
                .EnsureDemoDataAsync(
                    _mongoDbService
                );

            var assets =
                await _mongoDbService
                    .GetAllAsync();

            return Ok(
                assets
            );
        }

        // =========================================
        // CREATE
        // =========================================

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Asset>>
            CreateAsset(
                CreateAssetRequest request
            )
        {
            var name =
                request.Name.Trim();

            var type =
                request.Type.Trim();

            var category =
                request.Category.Trim();

            var location =
                request.Location.Trim();

            var description =
                request.Description.Trim();

            if (
                string.IsNullOrWhiteSpace(
                    name
                )
            )
            {
                return BadRequest(
                    "Resource name is required."
                );
            }

            if (
                name.Length >
                100
            )
            {
                return BadRequest(
                    "Resource name cannot exceed 100 characters."
                );
            }

            if (
                type ==
                "Other"
            )
            {
                type =
                    "Shared Resource";
            }

            var allowedTypes =
                new[]
                {
                    "Desk",
                    "Room",
                    "Equipment",
                    "Shared Resource"
                };

            if (
                !allowedTypes.Contains(
                    type
                )
            )
            {
                return BadRequest(
                    "Invalid resource type."
                );
            }

            if (
                location !=
                    "Floor 15" &&
                location !=
                    "Floor 16"
            )
            {
                return BadRequest(
                    "Floor must be Floor 15 or Floor 16."
                );
            }

            if (
                string.IsNullOrWhiteSpace(
                    category
                )
            )
            {
                category =
                    GetDefaultCategory(
                        type
                    );
            }

            if (
                category.Length >
                80
            )
            {
                return BadRequest(
                    "Category cannot exceed 80 characters."
                );
            }

            if (
                description.Length >
                300
            )
            {
                return BadRequest(
                    "Description cannot exceed 300 characters."
                );
            }

            var features =
                NormalizeFeatures(
                    request.Features
                );

            if (
                features.Count >
                10
            )
            {
                return BadRequest(
                    "A resource can have a maximum of 10 features."
                );
            }

            if (
                features.Any(
                    feature =>
                        feature.Length >
                        60
                )
            )
            {
                return BadRequest(
                    "Each feature can contain a maximum of 60 characters."
                );
            }

            var status =
                request.Status.Trim();

            if (
                type ==
                "Room"
            )
            {
                status =
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
                        status
                    )
                )
                {
                    return BadRequest(
                        "Invalid resource status."
                    );
                }
            }

            var asset =
                new Asset
                {
                    Name =
                        name,

                    Type =
                        type,

                    Category =
                        category,

                    Location =
                        location,

                    Description =
                        description,

                    Features =
                        features,

                    Status =
                        status
                };

            var createdAsset =
                await _mongoDbService
                    .CreateAsync(
                        asset
                    );

            return Created(
                $"/api/assets/{createdAsset.Id}",
                createdAsset
            );
        }

        // =========================================
        // UPDATE
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
                    .GetByIdAsync(
                        id
                    );

            if (
                asset ==
                null
            )
            {
                return NotFound(
                    "Resource not found."
                );
            }

            var location =
                request.Location.Trim();

            var status =
                request.Status.Trim();

            if (
                location !=
                    "Floor 15" &&
                location !=
                    "Floor 16"
            )
            {
                return BadRequest(
                    "Floor must be Floor 15 or Floor 16."
                );
            }

            string? category =
                null;

            if (
                request.Category !=
                null
            )
            {
                category =
                    request.Category
                        .Trim();

                if (
                    string.IsNullOrWhiteSpace(
                        category
                    )
                )
                {
                    category =
                        GetDefaultCategory(
                            NormalizeLegacyType(
                                asset.Type
                            )
                        );
                }

                if (
                    category.Length >
                    80
                )
                {
                    return BadRequest(
                        "Category cannot exceed 80 characters."
                    );
                }
            }

            string? description =
                null;

            if (
                request.Description !=
                null
            )
            {
                description =
                    request.Description
                        .Trim();

                if (
                    description.Length >
                    300
                )
                {
                    return BadRequest(
                        "Description cannot exceed 300 characters."
                    );
                }
            }

            List<string>? features =
                null;

            if (
                request.Features !=
                null
            )
            {
                features =
                    NormalizeFeatures(
                        request.Features
                    );

                if (
                    features.Count >
                    10
                )
                {
                    return BadRequest(
                        "A resource can have a maximum of 10 features."
                    );
                }

                if (
                    features.Any(
                        feature =>
                            feature.Length >
                            60
                    )
                )
                {
                    return BadRequest(
                        "Each feature can contain a maximum of 60 characters."
                    );
                }
            }

            if (
                asset.Type ==
                "Room"
            )
            {
                if (
                    status !=
                        "Available" &&
                    status !=
                        "Maintenance"
                )
                {
                    return BadRequest(
                        "Meeting room status must be Available or Maintenance."
                    );
                }

                if (
                    status ==
                        "Maintenance" &&
                    asset.Status !=
                        "Maintenance"
                )
                {
                    var reservations =
                        await _mongoDbService
                            .GetActiveOrFutureReservationsAsync(
                                id
                            );

                    if (
                        reservations.Count >
                        0
                    )
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
                        status
                    )
                )
                {
                    return BadRequest(
                        "Invalid resource status."
                    );
                }
            }

            var updatedAsset =
                await _mongoDbService
                    .UpdateAssetAsync(
                        id,
                        location,
                        status,
                        category,
                        description,
                        features
                    );

            if (
                updatedAsset ==
                null
            )
            {
                return NotFound(
                    "Resource not found."
                );
            }

            return Ok(
                updatedAsset
            );
        }

        // =========================================
        // DELETE
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
                    .GetByIdAsync(
                        id
                    );

            if (
                asset ==
                null
            )
            {
                return NotFound(
                    "Asset not found."
                );
            }

            if (
                asset.Type ==
                "Room"
            )
            {
                var hasReservations =
                    await _mongoDbService
                        .HasActiveOrFutureReservationsAsync(
                            id
                        );

                if (
                    hasReservations
                )
                {
                    return Conflict(
                        "This room has active or upcoming reservations. Cancel them before deleting the room."
                    );
                }
            }

            var deleted =
                await _mongoDbService
                    .DeleteAsync(
                        id
                    );

            if (
                !deleted
            )
            {
                return NotFound(
                    "Asset not found."
                );
            }

            return NoContent();
        }

        // =========================================
        // HELPERS
        // =========================================

        private static string
            GetDefaultCategory(
                string type
            )
        {
            return type switch
            {
                "Room" =>
                    "Meeting Room",

                "Desk" =>
                    "Standard Desk",

                "Equipment" =>
                    "General Equipment",

                "Shared Resource" =>
                    "Shared Resource",

                _ =>
                    "General"
            };
        }

        private static string
            NormalizeLegacyType(
                string type
            )
        {
            return type ==
                "Other"
                ? "Shared Resource"
                : type;
        }

        private static List<string>
            NormalizeFeatures(
                IEnumerable<string> features
            )
        {
            return features
                .Where(
                    feature =>
                        !string.IsNullOrWhiteSpace(
                            feature
                        )
                )
                .Select(
                    feature =>
                        feature.Trim()
                )
                .Distinct(
                    StringComparer.OrdinalIgnoreCase
                )
                .ToList();
        }
    }
}