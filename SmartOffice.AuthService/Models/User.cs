namespace SmartOffice.AuthService.Models
{
    public class User
    {
        public int Id { get; set; }

        /*
            Name currently represents the login username.

            We keep the existing database field for now
            so we do not unnecessarily rename an existing
            column during this feature.
        */

        public string Name { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "Member";
    }
}