using System.Security.Claims;
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
    public class ReservationsController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public ReservationsController(
            MongoDbService mongoDbService
        )
        {
            _mongoDbService = mongoDbService;
        }

        // =========================================
        // GET ALL RESERVATIONS
        // =========================================

        [HttpGet]
        public async Task<ActionResult<List<Reservation>>> GetReservations()
        {
            var reservations =
                await _mongoDbService.GetReservationsAsync();

            return Ok(reservations);
        }

        // =========================================
        // GET MY RESERVATIONS
        // =========================================

        [HttpGet("mine")]
        public async Task<ActionResult<List<Reservation>>> GetMyReservations()
        {
            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var reservations =
                await _mongoDbService.GetReservationsAsync();

            var myReservations = reservations
                .Where(reservation =>
                    reservation.BookedByUserId == userId
                )
                .OrderBy(reservation =>
                    reservation.StartTimeUtc
                )
                .ToList();

            return Ok(myReservations);
        }

        // =========================================
        // GET RESERVATIONS FOR A ROOM
        // =========================================

        [HttpGet("room/{assetId}")]
        public async Task<ActionResult<List<Reservation>>>
            GetReservationsForRoom(string assetId)
        {
            var asset =
                await _mongoDbService.GetByIdAsync(assetId);

            if (asset == null)
            {
                return NotFound("Room not found.");
            }

            if (asset.Type != "Room")
            {
                return BadRequest(
                    "Reservations are only supported for meeting rooms."
                );
            }

            var reservations =
                await _mongoDbService
                    .GetReservationsForAssetAsync(assetId);

            return Ok(reservations);
        }

        // =========================================
        // CREATE RESERVATION
        // Admin + Member
        // =========================================

        [HttpPost]
        public async Task<ActionResult<Reservation>>
            CreateReservation(
                CreateReservationRequest request
            )
        {
            if (string.IsNullOrWhiteSpace(request.AssetId))
            {
                return BadRequest(
                    "Meeting room is required."
                );
            }

            if (request.StartTimeUtc >= request.EndTimeUtc)
            {
                return BadRequest(
                    "End time must be later than start time."
                );
            }

            var nowUtc = DateTime.UtcNow;

            if (request.StartTimeUtc < nowUtc)
            {
                return BadRequest(
                    "A reservation cannot start in the past."
                );
            }

            var asset =
                await _mongoDbService
                    .GetByIdAsync(request.AssetId);

            if (asset == null)
            {
                return NotFound(
                    "Meeting room not found."
                );
            }

            if (asset.Type != "Room")
            {
                return BadRequest(
                    "Only meeting rooms can be reserved."
                );
            }

            if (asset.Status == "Maintenance")
            {
                return Conflict(
                    "This meeting room is currently under maintenance."
                );
            }

            var hasConflict =
                await _mongoDbService
                    .HasReservationConflictAsync(
                        request.AssetId,
                        request.StartTimeUtc,
                        request.EndTimeUtc
                    );

            if (hasConflict)
            {
                return Conflict(
                    "This meeting room is already booked during the selected time."
                );
            }

            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            var userName =
                User.FindFirstValue(
                    ClaimTypes.Name
                );

            if (string.IsNullOrWhiteSpace(userId) ||
                string.IsNullOrWhiteSpace(userName))
            {
                return Unauthorized(
                    "Unable to identify the authenticated user."
                );
            }

            var reservation = new Reservation
            {
                AssetId = asset.Id!,
                RoomName = asset.Name,
                Floor = asset.Location,

                StartTimeUtc =
                    request.StartTimeUtc,

                EndTimeUtc =
                    request.EndTimeUtc,

                BookedByUserId = userId,

                BookedBy = userName,

                CreatedAtUtc = DateTime.UtcNow
            };

            var createdReservation =
                await _mongoDbService
                    .CreateReservationAsync(
                        reservation
                    );

            return Created(
                $"/api/reservations/{createdReservation.Id}",
                createdReservation
            );
        }

        // =========================================
        // CANCEL RESERVATION
        //
        // Member -> only own reservation
        // Admin  -> any reservation
        // =========================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(
            string id
        )
        {
            var reservation =
                await _mongoDbService
                    .GetReservationByIdAsync(id);

            if (reservation == null)
            {
                return NotFound(
                    "Reservation not found."
                );
            }

            var currentUserId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            var isAdmin =
                User.IsInRole("Admin");

            var isOwner =
                reservation.BookedByUserId ==
                currentUserId;

            if (!isAdmin && !isOwner)
            {
                return Forbid();
            }

            var deleted =
                await _mongoDbService
                    .DeleteReservationAsync(id);

            if (!deleted)
            {
                return NotFound(
                    "Reservation not found."
                );
            }

            return NoContent();
        }
    }
}