using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using sapui_study.Domain.Entities;
using sapui_study.Infrastructure.Data;
using sapui_study.Models;
using System.Threading.Tasks;

namespace sapui_study.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }

        [HttpGet("query")]
        public async Task<IActionResult> GetProducts([FromQuery] string filterBy = "id", [FromQuery] string orderBy = "asc", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var totalItems = await _context.Products.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            IQueryable<Product> query = _context.Products;

            query = filterBy.ToLower() switch
            {
                "title" => orderBy.ToLower() == "asc"
                    ? query.OrderBy(p => p.Title)
                    : query.OrderByDescending(p => p.Title),
                "price" => orderBy.ToLower() == "asc"
                    ? query.OrderBy(p => p.Price)
                    : query.OrderByDescending(p => p.Price),
                _ => orderBy.ToLower() == "asc"
                    ? query.OrderBy(p => p.Id)
                    : query.OrderByDescending(p => p.Id)
            };

            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize,
                Items = products
            };

            return Ok(response);
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetProductsByFilter([FromQuery] string filter)
        {
            var products = await _context.Products
                .Where(p => p.Title.Contains(filter))
                .ToListAsync();
            return Ok(products);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductModel productModel)
        {
            var product = new Product
            {
                Title = productModel.Title,
                Description = productModel.Description,
                Price = productModel.Price
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductModel productModel)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            product.Title = productModel.Title;
            product.Description = productModel.Description;
            product.Price = productModel.Price;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
