namespace SmartOffice.AssetService.Dtos
{
    public class UpdateLockerAvailabilityRequest
    {
        /*
            Admin controlled statuses:

            Available
            Unavailable
            Maintenance
        */

        public string Status { get; set; } = string.Empty;
    }
}