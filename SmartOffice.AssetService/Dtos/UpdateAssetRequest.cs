namespace SmartOffice.AssetService.Dtos
{
    public class UpdateAssetRequest
    {
        public string Location { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        /*
            These fields are nullable intentionally.

            Existing frontend screens currently send
            only Location and Status.

            If one of these properties is not sent,
            the backend keeps its existing value.
        */

        public string? Category { get; set; }

        public string? Description { get; set; }

        public List<string>? Features { get; set; }
    }
}