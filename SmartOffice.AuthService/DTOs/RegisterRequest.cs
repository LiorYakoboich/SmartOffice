namespace SmartOffice.AuthService.DTOs
{
    public class RegisterRequest
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        /*
            Name is the username used for login.
        */

        public string Name { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }
}