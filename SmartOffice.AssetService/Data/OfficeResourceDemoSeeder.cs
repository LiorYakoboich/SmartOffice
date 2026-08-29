using SmartOffice.AssetService.Models;

namespace SmartOffice.AssetService.Data
{
    public static class OfficeResourceDemoSeeder
    {
        private static readonly SemaphoreSlim SeedLock =
            new(1, 1);

        private static bool _seedChecked;

        public static async Task EnsureDemoDataAsync(
            MongoDbService mongoDbService
        )
        {
            if (_seedChecked)
            {
                return;
            }

            await SeedLock.WaitAsync();

            try
            {
                if (_seedChecked)
                {
                    return;
                }

                var existingAssets =
                    await mongoDbService
                        .GetAllAsync();

                var demoNames =
                    GetDemoAssets()
                        .Select(
                            asset =>
                                asset.Name
                        )
                        .ToHashSet(
                            StringComparer.OrdinalIgnoreCase
                        );

                /*
                    If even one of our demo resources exists,
                    assume the demo inventory was already seeded.

                    This prevents deleted resources from
                    immediately returning on every refresh.
                */

                if (
                    existingAssets.Any(
                        asset =>
                            demoNames.Contains(
                                asset.Name
                            )
                    )
                )
                {
                    _seedChecked = true;

                    return;
                }

                foreach (
                    var asset
                    in GetDemoAssets()
                )
                {
                    await mongoDbService
                        .CreateAsync(
                            asset
                        );
                }

                _seedChecked = true;
            }
            finally
            {
                SeedLock.Release();
            }
        }

        private static List<Asset>
            GetDemoAssets()
        {
            return new List<Asset>
            {
                new()
                {
                    Name = "Desk 15-A01",
                    Type = "Desk",
                    Category = "Standing Desk",
                    Location = "Floor 15",
                    Description = "Height-adjustable workstation near the east windows.",
                    Features =
                    [
                        "2 Monitors",
                        "USB-C Dock",
                        "Adjustable Height",
                        "Ergonomic Chair"
                    ],
                    Status = "Available"
                },

                new()
                {
                    Name = "Desk 15-A02",
                    Type = "Desk",
                    Category = "Dual Monitor Desk",
                    Location = "Floor 15",
                    Description = "Developer workstation with dual display setup.",
                    Features =
                    [
                        "2 Monitors",
                        "Keyboard & Mouse",
                        "USB-C Dock"
                    ],
                    Status = "In Use"
                },

                new()
                {
                    Name = "Desk 15-B03",
                    Type = "Desk",
                    Category = "Window Desk",
                    Location = "Floor 15",
                    Description = "Quiet workstation beside the office windows.",
                    Features =
                    [
                        "1 Monitor",
                        "Natural Light",
                        "Ergonomic Chair"
                    ],
                    Status = "Available"
                },

                new()
                {
                    Name = "Desk 16-A01",
                    Type = "Desk",
                    Category = "Focus Desk",
                    Location = "Floor 16",
                    Description = "Low-distraction workstation for focused individual work.",
                    Features =
                    [
                        "Privacy Screen",
                        "USB-C Dock",
                        "Ergonomic Chair"
                    ],
                    Status = "Available"
                },

                new()
                {
                    Name = "Desk 16-A02",
                    Type = "Desk",
                    Category = "Standard Desk",
                    Location = "Floor 16",
                    Description = "Standard employee workstation currently undergoing maintenance.",
                    Features =
                    [
                        "1 Monitor",
                        "Keyboard & Mouse"
                    ],
                    Status = "Maintenance"
                },

                new()
                {
                    Name = "Jabra Evolve2 65",
                    Type = "Equipment",
                    Category = "Headset",
                    Location = "Floor 15",
                    Description = "Wireless business headset for calls and online meetings.",
                    Features =
                    [
                        "Bluetooth",
                        "Noise Cancelling",
                        "Wireless",
                        "Rechargeable"
                    ],
                    Status = "Available"
                },

                new()
                {
                    Name = "Logitech Brio 4K",
                    Type = "Equipment",
                    Category = "Webcam",
                    Location = "Floor 16",
                    Description = "4K webcam for high-quality video calls and presentations.",
                    Features =
                    [
                        "4K",
                        "USB-C",
                        "Portable"
                    ],
                    Status = "In Use"
                },

                new()
                {
                    Name = "Dell WD19S USB-C Dock",
                    Type = "Equipment",
                    Category = "Docking Station",
                    Location = "Floor 15",
                    Description = "USB-C docking station for laptops and shared workstations.",
                    Features =
                    [
                        "USB-C",
                        "HDMI",
                        "2 Monitors"
                    ],
                    Status = "Available"
                },

                new()
                {
                    Name = "ASUS ZenScreen MB16AC",
                    Type = "Equipment",
                    Category = "Portable Monitor",
                    Location = "Floor 16",
                    Description = "Portable secondary monitor for flexible work setups.",
                    Features =
                    [
                        "USB-C",
                        "Portable"
                    ],
                    Status = "Available"
                },

                new()
                {
                    Name = "HDMI Cable Kit",
                    Type = "Equipment",
                    Category = "Presentation Kit",
                    Location = "Floor 15",
                    Description = "Shared HDMI cables and adapters for meeting room presentations.",
                    Features =
                    [
                        "HDMI",
                        "Portable"
                    ],
                    Status = "Available"
                },

                new()
                {
                    Name = "Logitech MX Keys Combo",
                    Type = "Equipment",
                    Category = "Keyboard & Mouse",
                    Location = "Floor 16",
                    Description = "Wireless keyboard and mouse combo for temporary workstations.",
                    Features =
                    [
                        "Wireless",
                        "Bluetooth",
                        "Rechargeable"
                    ],
                    Status = "In Use"
                },

                new()
                {
                    Name = "Mobile Presentation Kit",
                    Type = "Equipment",
                    Category = "Presentation Kit",
                    Location = "Floor 16",
                    Description = "Portable presentation equipment for workshops and events.",
                    Features =
                    [
                        "HDMI",
                        "USB-C",
                        "Portable"
                    ],
                    Status = "Available"
                },

                new()
                {
                    Name = "Printer Station 15-A",
                    Type = "Shared Resource",
                    Category = "Printer Station",
                    Location = "Floor 15",
                    Description = "Shared print and scan station for Floor 15 employees.",
                    Features =
                    [
                        "Color Printing",
                        "Scanner"
                    ],
                    Status = "Available"
                },

                new()
                {
                    Name = "Parking Spot P-12",
                    Type = "Shared Resource",
                    Category = "Parking Spot",
                    Location = "Floor 15",
                    Description = "Reserved company parking space for temporary employee use.",
                    Features =
                    [
                        "Reserved",
                        "Accessible"
                    ],
                    Status = "In Use"
                },

                new()
                {
                    Name = "Storage Cabinet 16-B",
                    Type = "Shared Resource",
                    Category = "Storage Cabinet",
                    Location = "Floor 16",
                    Description = "Secure shared storage cabinet for office equipment.",
                    Features =
                    [
                        "Secure Storage",
                        "Lockable"
                    ],
                    Status = "Available"
                },

                new()
                {
                    Name = "Visitor Access Kit",
                    Type = "Shared Resource",
                    Category = "Visitor Kit",
                    Location = "Floor 15",
                    Description = "Temporary office access kit prepared for visitors and contractors.",
                    Features =
                    [
                        "Daily Use",
                        "Personal Use"
                    ],
                    Status = "Available"
                }
            };
        }
    }
}