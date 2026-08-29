namespace SmartOffice.AssetService.Dtos
{
    public class CreateAssetRequest
    {
        public string Name { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<string> Features { get; set; } = new();

        public string Status { get; set; } = "Available";
    }
}