using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartOffice.AssetService.Models
{
    public class LockerRequest
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string LockerId { get; set; } = string.Empty;

        public string LockerName { get; set; } = string.Empty;

        public string Floor { get; set; } = string.Empty;

        /*
            User who requested the locker.
        */

        public string RequestedByUserId { get; set; } = string.Empty;

        public string RequestedBy { get; set; } = string.Empty;

        /*
            Workflow statuses:

            Pending
            Approved
            Rejected
            Collected
            Returned
            Cancelled
        */

        public string Status { get; set; } = "Pending";

        /*
            True while the request still owns/reserves
            the locker.

            Pending  -> true
            Approved -> true
            Collected -> true

            Rejected / Returned / Cancelled -> false
        */

        public bool IsActive { get; set; } = true;

        public DateTime RequestedAtUtc { get; set; } = DateTime.UtcNow;

        /*
            HR / Admin review information.
        */

        public string? ReviewedByUserId { get; set; }

        public string? ReviewedBy { get; set; }

        public DateTime? ReviewedAtUtc { get; set; }

        /*
            Physical key lifecycle.
        */

        public DateTime? KeyCollectedAtUtc { get; set; }

        public DateTime? ReturnedAtUtc { get; set; }

        public DateTime? CancelledAtUtc { get; set; }
    }
}