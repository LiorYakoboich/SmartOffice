namespace SmartOffice.AuthService.Dtos
{
    public class UserManagementResponse
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string DisplayName { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;
    }
}