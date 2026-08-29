namespace SmartOffice.AssetService.Dtos
{
    public class LockerSummaryResponse
    {
        public string Id { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Floor { get; set; } = string.Empty;

        /*
            Physical / operational state controlled
            by Admin.

            Available
            Unavailable
            Maintenance
        */

        public string OperationalStatus { get; set; } = string.Empty;

        /*
            User-facing calculated state.

            Available
            Pending HR Approval
            Ready for Key Pickup
            Assigned
            Unavailable
            Maintenance
        */

        public string DisplayStatus { get; set; } = string.Empty;

        public bool IsRequestable { get; set; }

        public bool IsMyRequest { get; set; }

        public string? ActiveRequestId { get; set; }

        public string? RequestStatus { get; set; }

        /*
            Member does not see who owns another locker.

            HR/Admin can see this information.

            A Member can also see their own name on
            their own request.
        */

        public string? RequestedBy { get; set; }
    }
}