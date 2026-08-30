using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartOffice.AssetService.Models
{
    public class EquipmentRequest
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string AssetId { get; set; } = string.Empty;

        public string AssetName { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string RequestedByUserId { get; set; } = string.Empty;

        public string RequestedBy { get; set; } = string.Empty;

        /*
            Workflow:

            Pending
            Approved
            Rejected
            Collected
            Returned
            Cancelled
        */

        public string Status { get; set; } = "Pending";

        /*
            Active while the equipment is reserved
            for an employee or currently being used.

            Pending   -> true
            Approved  -> true
            Collected -> true

            Rejected  -> false
            Returned  -> false
            Cancelled -> false
        */

        public bool IsActive { get; set; } = true;

        public DateTime RequestedAtUtc { get; set; } = DateTime.UtcNow;

        public string? ReviewedByUserId { get; set; }

        public string? ReviewedBy { get; set; }

        public DateTime? ReviewedAtUtc { get; set; }

        public DateTime? CollectedAtUtc { get; set; }

        public DateTime? ReturnedAtUtc { get; set; }

        public DateTime? CancelledAtUtc { get; set; }
    }
}