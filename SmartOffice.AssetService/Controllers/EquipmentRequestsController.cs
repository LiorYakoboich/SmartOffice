using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SmartOffice.AssetService.Data;
using SmartOffice.AssetService.Models;

namespace SmartOffice.AssetService.Controllers
{
    [ApiController]
    [Route("api/equipment-requests")]
    [Authorize]
    public class EquipmentRequestsController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        private readonly EquipmentRequestService
            _equipmentRequestService;

        public EquipmentRequestsController(
            MongoDbService mongoDbService,
            IConfiguration configuration
        )
        {
            _mongoDbService =
                mongoDbService;

            /*
                Keeping this service isolated from
                MongoDbService avoids turning the
                main database class into one huge file.
            */

            _equipmentRequestService =
                new EquipmentRequestService(
                    configuration
                );
        }

        // =========================================
        // MEMBER - MY REQUESTS
        // =========================================

        [HttpGet("mine")]
        [Authorize(Roles = "Member")]
        public async Task<ActionResult<List<EquipmentRequest>>>
            GetMyRequests()
        {
            var requests =
                await _equipmentRequestService
                    .GetRequestsForUserAsync(
                        GetCurrentUserId()
                    );

            return Ok(
                requests
            );
        }

        // =========================================
        // ADMIN - ACTIVE REQUESTS
        // =========================================

        [HttpGet("active")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<EquipmentRequest>>>
            GetActiveRequests()
        {
            var requests =
                await _equipmentRequestService
                    .GetActiveRequestsAsync();

            return Ok(
                requests
            );
        }

        // =========================================
        // ADMIN - PENDING REQUESTS
        // =========================================

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<EquipmentRequest>>>
            GetPendingRequests()
        {
            var requests =
                await _equipmentRequestService
                    .GetPendingRequestsAsync();

            return Ok(
                requests
            );
        }

        // =========================================
        // MEMBER - REQUEST EQUIPMENT
        // =========================================

        [HttpPost("{assetId}")]
        [Authorize(Roles = "Member")]
        public async Task<ActionResult<EquipmentRequest>>
            RequestEquipment(
                string assetId
            )
        {
            var asset =
                await _mongoDbService
                    .GetByIdAsync(
                        assetId
                    );

            if (
                asset ==
                null
            )
            {
                return NotFound(
                    "Equipment not found."
                );
            }

            /*
                This workflow is only for Equipment.

                Desks, Rooms and Shared Resources
                use their own behavior.
            */

            if (
                asset.Type !=
                "Equipment"
            )
            {
                return BadRequest(
                    "Only equipment can be requested."
                );
            }

            if (
                asset.Status !=
                "Available"
            )
            {
                return Conflict(
                    "This equipment is currently unavailable."
                );
            }

            /*
                One physical equipment item can only
                have one active workflow at a time.
            */

            var existingRequest =
                await _equipmentRequestService
                    .GetActiveRequestForAssetAsync(
                        assetId
                    );

            if (
                existingRequest !=
                null
            )
            {
                return Conflict(
                    "This equipment already has an active request."
                );
            }

            var request =
                new EquipmentRequest
                {
                    AssetId =
                        asset.Id
                        ?? string.Empty,

                    AssetName =
                        asset.Name,

                    Category =
                        asset.Category,

                    Location =
                        asset.Location,

                    RequestedByUserId =
                        GetCurrentUserId(),

                    RequestedBy =
                        GetCurrentUserName(),

                    Status =
                        "Pending",

                    IsActive =
                        true
                };

            var createdRequest =
                await _equipmentRequestService
                    .CreateAsync(
                        request
                    );

            return Created(
                $"/api/equipment-requests/{createdRequest.Id}",
                createdRequest
            );
        }

        // =========================================
        // MEMBER - CANCEL
        // =========================================

        [HttpPost("{requestId}/cancel")]
        [Authorize(Roles = "Member")]
        public async Task<ActionResult<EquipmentRequest>>
            CancelRequest(
                string requestId
            )
        {
            var request =
                await _equipmentRequestService
                    .GetByIdAsync(
                        requestId
                    );

            if (
                request ==
                null
            )
            {
                return NotFound(
                    "Equipment request not found."
                );
            }

            if (
                request.RequestedByUserId !=
                GetCurrentUserId()
            )
            {
                return Forbid();
            }

            if (
                !request.IsActive
            )
            {
                return Conflict(
                    "This request is no longer active."
                );
            }

            /*
                Once physical equipment was collected,
                it must be returned through Admin.
            */

            if (
                request.Status ==
                "Collected"
            )
            {
                return Conflict(
                    "This equipment has already been collected. Please return it to Admin."
                );
            }

            var cancelled =
                await _equipmentRequestService
                    .CancelAsync(
                        requestId
                    );

            return Ok(
                cancelled
            );
        }

        // =========================================
        // ADMIN - APPROVE
        // =========================================

        [HttpPost("{requestId}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EquipmentRequest>>
            ApproveRequest(
                string requestId
            )
        {
            var request =
                await _equipmentRequestService
                    .GetByIdAsync(
                        requestId
                    );

            if (
                request ==
                null
            )
            {
                return NotFound(
                    "Equipment request not found."
                );
            }

            if (
                request.Status !=
                "Pending"
            )
            {
                return Conflict(
                    "Only pending requests can be approved."
                );
            }

            var asset =
                await _mongoDbService
                    .GetByIdAsync(
                        request.AssetId
                    );

            if (
                asset ==
                null
            )
            {
                return NotFound(
                    "Equipment not found."
                );
            }

            if (
                asset.Status !=
                "Available"
            )
            {
                return Conflict(
                    "This equipment is no longer available."
                );
            }

            var approved =
                await _equipmentRequestService
                    .ApproveAsync(
                        requestId,
                        GetCurrentUserId(),
                        GetCurrentUserName()
                    );

            return Ok(
                approved
            );
        }

        // =========================================
        // ADMIN - REJECT
        // =========================================

        [HttpPost("{requestId}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EquipmentRequest>>
            RejectRequest(
                string requestId
            )
        {
            var request =
                await _equipmentRequestService
                    .GetByIdAsync(
                        requestId
                    );

            if (
                request ==
                null
            )
            {
                return NotFound(
                    "Equipment request not found."
                );
            }

            if (
                request.Status !=
                "Pending"
            )
            {
                return Conflict(
                    "Only pending requests can be rejected."
                );
            }

            var rejected =
                await _equipmentRequestService
                    .RejectAsync(
                        requestId,
                        GetCurrentUserId(),
                        GetCurrentUserName()
                    );

            return Ok(
                rejected
            );
        }

        // =========================================
        // ADMIN - COLLECTED
        // =========================================

        [HttpPost("{requestId}/collect")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EquipmentRequest>>
            MarkCollected(
                string requestId
            )
        {
            var request =
                await _equipmentRequestService
                    .GetByIdAsync(
                        requestId
                    );

            if (
                request ==
                null
            )
            {
                return NotFound(
                    "Equipment request not found."
                );
            }

            if (
                request.Status !=
                "Approved"
            )
            {
                return Conflict(
                    "The request must be approved before the equipment can be collected."
                );
            }

            var asset =
                await _mongoDbService
                    .GetByIdAsync(
                        request.AssetId
                    );

            if (
                asset ==
                null
            )
            {
                return NotFound(
                    "Equipment not found."
                );
            }

            if (
                asset.Status !=
                "Available"
            )
            {
                return Conflict(
                    "The equipment is no longer available."
                );
            }

            /*
                Collection means the physical item
                is now being used.
            */

            var updatedAsset =
                await _mongoDbService
                    .UpdateAssetAsync(
                        asset.Id!,
                        asset.Location,
                        "In Use"
                    );

            if (
                updatedAsset ==
                null
            )
            {
                return NotFound(
                    "Equipment not found."
                );
            }

            var collected =
                await _equipmentRequestService
                    .MarkCollectedAsync(
                        requestId
                    );

            return Ok(
                collected
            );
        }

        // =========================================
        // ADMIN - RETURNED
        // =========================================

        [HttpPost("{requestId}/return")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EquipmentRequest>>
            MarkReturned(
                string requestId
            )
        {
            var request =
                await _equipmentRequestService
                    .GetByIdAsync(
                        requestId
                    );

            if (
                request ==
                null
            )
            {
                return NotFound(
                    "Equipment request not found."
                );
            }

            if (
                request.Status !=
                "Collected"
            )
            {
                return Conflict(
                    "Only collected equipment can be returned."
                );
            }

            var asset =
                await _mongoDbService
                    .GetByIdAsync(
                        request.AssetId
                    );

            if (
                asset ==
                null
            )
            {
                return NotFound(
                    "Equipment not found."
                );
            }

            /*
                Returned equipment becomes available
                for the next employee.
            */

            var updatedAsset =
                await _mongoDbService
                    .UpdateAssetAsync(
                        asset.Id!,
                        asset.Location,
                        "Available"
                    );

            if (
                updatedAsset ==
                null
            )
            {
                return NotFound(
                    "Equipment not found."
                );
            }

            var returned =
                await _equipmentRequestService
                    .MarkReturnedAsync(
                        requestId
                    );

            return Ok(
                returned
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
    }
}