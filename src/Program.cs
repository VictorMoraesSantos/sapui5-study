using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using sapui_study.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();  

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = true,
    DefaultContentType = "text/plain",
    ContentTypeProvider = new FileExtensionContentTypeProvider
    {
        Mappings =
        {
            [".properties"] = "text/plain"
        }
    }
});

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();
