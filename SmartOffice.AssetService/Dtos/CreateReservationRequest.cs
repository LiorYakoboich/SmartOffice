namespace SmartOffice.AssetService.Dtos
{
    public class CreateReservationRequest
    {
        public string AssetId { get; set; } = string.Empty;

        public DateTime StartTimeUtc { get; set; }

        public DateTime EndTimeUtc { get; set; }
    }
}