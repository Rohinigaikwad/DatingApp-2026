using API;
using API.Data;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using API.Middlewares;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddCors();

builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddScoped<IPhotoService,PhotoService>();

builder.Services.AddScoped<IMemberRepository, MemberRepository>();

builder.Services.AddScoped<ILikesRepository, LikesRepository>();

builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<LogUserActivity>();

builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

builder.Services.AddIdentityCore<AppUser>(opt =>
{
    opt.Password.RequireNonAlphanumeric = false;
    opt.User.RequireUniqueEmail = true;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(Options=>
    {
        var tokenKey= builder.Configuration["TokenKey"] ??
        throw new Exception("Token key not found -Program.cs");
        Options.TokenValidationParameters=new TokenValidationParameters
        {
            ValidateIssuerSigningKey=true,
            IssuerSigningKey= new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(tokenKey)),
            ValidateIssuer=false,
            ValidateAudience=false
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"))
    .AddPolicy("ModeratePhotoRole", policy => policy.RequireRole("Admin", "Moderator"));

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>(); //Exception Handling should be 1st middleware in the pipeline since if exceptin occures then it should handled by this midlleware and then proceed to next middleware

app.UseCors(policy => policy
.AllowAnyHeader()
.AllowAnyMethod()
.AllowCredentials()
.WithOrigins("http://localhost:4200", "https://localhost:4200"));

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

using var scope = app.Services.CreateScope();
var services= scope.ServiceProvider;
try
{
    var context=services.GetRequiredService<AppDbContext>();
    var userManager=services.GetRequiredService<UserManager<AppUser>>();
    await context.Database.MigrateAsync();
    await Seed.SeedUsers(userManager);
}
catch (Exception ex)
{
    var logger=services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex,"An error occured during migration");
}

app.Run();
