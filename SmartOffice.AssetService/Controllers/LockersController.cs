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
    public class LockersController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public LockersController(
            MongoDbService mongoDbService
        )
        {
            _mongoDbService =
                mongoDbService;
        }

        // =========================================
        // GET ALL LOCKERS
        // =========================================

        [HttpGet]
        public async Task<ActionResult<List<LockerSummaryResponse>>>
            GetLockers()
        {
            await _mongoDbService
                .EnsureLockersAsync();

            /*
                Presentation / portfolio demo data.

                The seeder is idempotent and will not
                recreate the demo assignments on every
                page refresh.
            */

            await LockerDemoSeeder
                .EnsureDemoDataAsync(
                    _mongoDbService
                );

            var lockers =
                await _mongoDbService
                    .GetLockersAsync();

            var activeRequests =
                await _mongoDbService
                    .GetActiveLockerRequestsAsync();

            var currentUserId =
                GetCurrentUserId();

            var isPrivileged =
                User.IsInRole(
                    "Admin"
                ) ||
                User.IsInRole(
                    "HR"
                );

            var myActiveRequest =
                activeRequests
                    .FirstOrDefault(
                        request =>
                            request.RequestedByUserId ==
                            currentUserId
                    );

            var response =
                lockers
                    .Select(
                        locker =>
                        {
                            var activeRequest =
                                activeRequests
                                    .FirstOrDefault(
                                        request =>
                                            request.LockerId ==
                                            locker.Id
                                    );

                            var isMyRequest =
                                activeRequest != null &&
                                activeRequest.RequestedByUserId ==
                                    currentUserId;

                            var displayStatus =
                                GetDisplayStatus(
                                    locker,
                                    activeRequest
                                );

                            var isRequestable =
                                User.IsInRole(
                                    "Member"
                                ) &&
                                locker.Status ==
                                    "Available" &&
                                activeRequest ==
                                    null &&
                                myActiveRequest ==
                                    null;

                            return new LockerSummaryResponse
                            {
                                Id =
                                    locker.Id
                                    ?? string.Empty,

                                Name =
                                    locker.Name,

                                Floor =
                                    locker.Location,

                                OperationalStatus =
                                    locker.Status,

                                DisplayStatus =
                                    displayStatus,

                                IsRequestable =
                                    isRequestable,

                                IsMyRequest =
                                    isMyRequest,

                                ActiveRequestId =
                                    activeRequest?.Id,

                                RequestStatus =
                                    activeRequest?.Status,

                                RequestedBy =
                                    isPrivileged ||
                                    isMyRequest
                                        ? activeRequest
                                            ?.RequestedBy
                                        : null
                            };
                        }
                    )
                    .ToList();

            return Ok(
                response
            );
        }

        // =========================================
        // MEMBER - MY REQUESTS
        // =========================================

        [HttpGet("my-requests")]
        [Authorize(Roles = "Member")]
        public async Task<ActionResult<List<LockerRequest>>>
            GetMyLockerRequests()
        {
            var userId =
                GetCurrentUserId();

            var requests =
                await _mongoDbService
                    .GetLockerRequestsForUserAsync(
                        userId
                    );

            return Ok(
                requests
            );
        }

        // =========================================
        // MEMBER - REQUEST LOCKER
        // =========================================

        [HttpPost("{lockerId}/request")]
        [Authorize(Roles = "Member")]
        public async Task<ActionResult<LockerRequest>>
            RequestLocker(
                string lockerId
            )
        {
            await _mongoDbService
                .EnsureLockersAsync();

            var locker =
                await _mongoDbService
                    .GetLockerByIdAsync(
                        lockerId
                    );

            if (locker == null)
            {
                return NotFound(
                    "Locker not found."
                );
            }

            if (
                locker.Status !=
                "Available"
            )
            {
                return Conflict(
                    "This locker is currently unavailable."
                );
            }

            var userId =
                GetCurrentUserId();

            var userName =
                GetCurrentUserName();

            var existingUserRequest =
                await _mongoDbService
                    .GetActiveLockerRequestForUserAsync(
                        userId
                    );

            if (
                existingUserRequest !=
                null
            )
            {
                return Conflict(
                    $"You already have an active locker request for {existingUserRequest.LockerName}."
                );
            }

            var existingLockerRequest =
                await _mongoDbService
                    .GetActiveLockerRequestForLockerAsync(
                        lockerId
                    );

            if (
                existingLockerRequest !=
                null
            )
            {
                return Conflict(
                    "This locker already has an active request."
                );
            }

            var request =
                new LockerRequest
                {
                    LockerId =
                        lockerId,

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
                };

            var createdRequest =
                await _mongoDbService
                    .CreateLockerRequestAsync(
                        request
                    );

            return Created(
                $"/api/lockers/requests/{createdRequest.Id}",
                createdRequest
            );
        }

        // =========================================
        // MEMBER - CANCEL
        // =========================================

        [HttpPost("requests/{requestId}/cancel")]
        [Authorize(Roles = "Member")]
        public async Task<ActionResult<LockerRequest>>
            CancelRequest(
                string requestId
            )
        {
            var request =
                await _mongoDbService
                    .GetLockerRequestByIdAsync(
                        requestId
                    );

            if (request == null)
            {
                return NotFound(
                    "Locker request not found."
                );
            }

            var userId =
                GetCurrentUserId();

            if (
                request.RequestedByUserId !=
                userId
            )
            {
                return Forbid();
            }

            if (
                request.Status ==
                "Collected"
            )
            {
                return Conflict(
                    "The locker key has already been collected. Please return the key to HR."
                );
            }

            if (
                !request.IsActive
            )
            {
                return Conflict(
                    "This locker request is no longer active."
                );
            }

            var cancelled =
                await _mongoDbService
                    .CancelLockerRequestAsync(
                        requestId
                    );

            return Ok(
                cancelled
            );
        }

        // =========================================
        // HR / ADMIN - PENDING
        // =========================================

        [HttpGet("requests/pending")]
        [Authorize(Roles = "HR,Admin")]
        public async Task<ActionResult<List<LockerRequest>>>
            GetPendingRequests()
        {
            var requests =
                await _mongoDbService
                    .GetPendingLockerRequestsAsync();

            return Ok(
                requests
            );
        }

        // =========================================
        // HR / ADMIN - ACTIVE
        // =========================================

        [HttpGet("requests/active")]
        [Authorize(Roles = "HR,Admin")]
        public async Task<ActionResult<List<LockerRequest>>>
            GetActiveRequests()
        {
            var requests =
                await _mongoDbService
                    .GetActiveLockerRequestsAsync();

            return Ok(
                requests
            );
        }

        // =========================================
        // APPROVE
        // =========================================

        [HttpPost("requests/{requestId}/approve")]
        [Authorize(Roles = "HR,Admin")]
        public async Task<ActionResult<LockerRequest>>
            ApproveRequest(
                string requestId
            )
        {
            var request =
                await _mongoDbService
                    .GetLockerRequestByIdAsync(
                        requestId
                    );

            if (request == null)
            {
                return NotFound(
                    "Locker request not found."
                );
            }

            if (
                request.Status !=
                "Pending"
            )
            {
                return Conflict(
                    "Only pending locker requests can be approved."
                );
            }

            var locker =
                await _mongoDbService
                    .GetLockerByIdAsync(
                        request.LockerId
                    );

            if (
                locker == null
            )
            {
                return NotFound(
                    "Locker not found."
                );
            }

            if (
                locker.Status !=
                "Available"
            )
            {
                return Conflict(
                    "The locker is no longer operationally available."
                );
            }

            var approved =
                await _mongoDbService
                    .ApproveLockerRequestAsync(
                        requestId,
                        GetCurrentUserId(),
                        GetCurrentUserName()
                    );

            return Ok(
                approved
            );
        }

        // =========================================
        // REJECT
        // =========================================

        [HttpPost("requests/{requestId}/reject")]
        [Authorize(Roles = "HR,Admin")]
        public async Task<ActionResult<LockerRequest>>
            RejectRequest(
                string requestId
            )
        {
            var request =
                await _mongoDbService
                    .GetLockerRequestByIdAsync(
                        requestId
                    );

            if (request == null)
            {
                return NotFound(
                    "Locker request not found."
                );
            }

            if (
                request.Status !=
                "Pending"
            )
            {
                return Conflict(
                    "Only pending locker requests can be rejected."
                );
            }

            var rejected =
                await _mongoDbService
                    .RejectLockerRequestAsync(
                        requestId,
                        GetCurrentUserId(),
                        GetCurrentUserName()
                    );

            return Ok(
                rejected
            );
        }

        // =========================================
        // KEY COLLECTED
        // =========================================

        [HttpPost("requests/{requestId}/collect")]
        [Authorize(Roles = "HR,Admin")]
        public async Task<ActionResult<LockerRequest>>
            MarkKeyCollected(
                string requestId
            )
        {
            var request =
                await _mongoDbService
                    .GetLockerRequestByIdAsync(
                        requestId
                    );

            if (request == null)
            {
                return NotFound(
                    "Locker request not found."
                );
            }

            if (
                request.Status !=
                "Approved"
            )
            {
                return Conflict(
                    "The locker request must be approved before the key can be collected."
                );
            }

            var updated =
                await _mongoDbService
                    .MarkLockerKeyCollectedAsync(
                        requestId
                    );

            return Ok(
                updated
            );
        }

        // =========================================
        // KEY RETURNED
        // =========================================

        [HttpPost("requests/{requestId}/return")]
        [Authorize(Roles = "HR,Admin")]
        public async Task<ActionResult<LockerRequest>>
            MarkKeyReturned(
                string requestId
            )
        {
            var request =
                await _mongoDbService
                    .GetLockerRequestByIdAsync(
                        requestId
                    );

            if (request == null)
            {
                return NotFound(
                    "Locker request not found."
                );
            }

            if (
                request.Status !=
                "Collected"
            )
            {
                return Conflict(
                    "Only a collected locker key can be returned."
                );
            }

            var updated =
                await _mongoDbService
                    .MarkLockerReturnedAsync(
                        requestId
                    );

            return Ok(
                updated
            );
        }

        // =========================================
        // ADMIN - AVAILABILITY
        // =========================================

        [HttpPut("{lockerId}/availability")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Asset>>
            UpdateLockerAvailability(
                string lockerId,
                UpdateLockerAvailabilityRequest request
            )
        {
            var locker =
                await _mongoDbService
                    .GetLockerByIdAsync(
                        lockerId
                    );

            if (locker == null)
            {
                return NotFound(
                    "Locker not found."
                );
            }

            var status =
                request.Status
                    .Trim();

            var allowedStatuses =
                new[]
                {
                    "Available",
                    "Unavailable",
                    "Maintenance"
                };

            if (
                !allowedStatuses.Contains(
                    status
                )
            )
            {
                return BadRequest(
                    "Locker status must be Available, Unavailable or Maintenance."
                );
            }

            if (
                status !=
                "Available"
            )
            {
                var activeRequest =
                    await _mongoDbService
                        .GetActiveLockerRequestForLockerAsync(
                            lockerId
                        );

                if (
                    activeRequest !=
                    null
                )
                {
                    return Conflict(
                        $"This locker has an active {activeRequest.Status} request for {activeRequest.RequestedBy}. Resolve it before changing the locker availability."
                    );
                }
            }

            var updatedLocker =
                await _mongoDbService
                    .UpdateLockerOperationalStatusAsync(
                        lockerId,
                        status
                    );

            if (
                updatedLocker ==
                null
            )
            {
                return NotFound(
                    "Locker not found."
                );
            }

            return Ok(
                updatedLocker
            );
        }

        // =========================================
        // HELPERS
        // =========================================

        private string
            GetCurrentUserId()
        {
            return User
                       .FindFirstValue(
                           ClaimTypes.NameIdentifier
                       )
                   ?? string.Empty;
        }

        private string
            GetCurrentUserName()
        {
            return User
                       .FindFirstValue(
                           ClaimTypes.Name
                       )
                   ?? "Unknown User";
        }

        private static string
            GetDisplayStatus(
                Asset locker,
                LockerRequest? request
            )
        {
            if (
                locker.Status ==
                "Maintenance"
            )
            {
                return "Maintenance";
            }

            if (
                locker.Status ==
                "Unavailable"
            )
            {
                return "Unavailable";
            }

            if (
                request ==
                null
            )
            {
                return "Available";
            }

            return request.Status switch
            {
                "Pending" =>
                    "Pending HR Approval",

                "Approved" =>
                    "Ready for Key Pickup",

                "Collected" =>
                    "Assigned",

                _ =>
                    "Available"
            };
        }
    }
}