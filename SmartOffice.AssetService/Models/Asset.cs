using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartOffice.AssetService.Models
{
    public class Asset
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Name { get; set; } = string.Empty;

        /*
            Main resource type:

            Room
            Desk
            Equipment
            Shared Resource
        */
        public string Type { get; set; } = string.Empty;

        /*
            More specific classification.

            Examples:

            Desk:
            - Standing Desk
            - Dual Monitor Desk
            - Window Desk

            Equipment:
            - Headset
            - Webcam
            - Docking Station

            Shared Resource:
            - Locker
            - Printer
            - Parking Spot
        */
        public string Category { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        /*
            Short human-readable explanation
            of the resource.
        */
        public string Description { get; set; } = string.Empty;

        /*
            Flexible characteristics that differ
            between resource types.

            Example:
            [
                "2 Monitors",
                "USB-C Dock",
                "Adjustable Height"
            ]
        */
        public List<string> Features { get; set; } = new();

        public string Status { get; set; } = "Available";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}