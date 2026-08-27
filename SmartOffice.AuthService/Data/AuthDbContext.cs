using Microsoft.EntityFrameworkCore;
using SmartOffice.AuthService.Models;

namespace SmartOffice.AuthService.Data
{
    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
    }
}