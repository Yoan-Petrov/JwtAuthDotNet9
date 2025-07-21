using JwtAuthDotNet9.Entities;
using Microsoft.EntityFrameworkCore;

namespace JwtAuthDotNet9.Data
{
    public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<CourseMaterial> CourseMaterials { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure Enrollment as join table
            modelBuilder.Entity<Enrollment>()
                .HasKey(e => new { e.UserId, e.CourseId });

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.User)
                .WithMany(u => u.Enrollments)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CourseId);

            // Trainer relationship
            modelBuilder.Entity<Course>()
                .HasOne(c => c.Trainer)
                .WithMany() // Trainer has no navigation back to courses
                .HasForeignKey(c => c.TrainerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}