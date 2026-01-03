using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sapui_study.Domain.Entities;
using sapui_study.Infrastructure.Data;
using sapui_study.Models;

namespace sapui_study.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
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
        public async Task<IActionResult> GetProducts([FromQuery] QueryFilter queryFilter)
        {
            IQueryable<Product> query = _context.Products;

            if (!string.IsNullOrWhiteSpace(queryFilter.FilterContains))
            {
                query = query.Where(p =>
                    p.Title.Contains(queryFilter.FilterContains) ||
                    p.Description.Contains(queryFilter.FilterContains));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)queryFilter.PageSize);

            query = queryFilter.FilterBy.ToLower() switch
            {
                "title" => queryFilter.OrderBy.ToLower() == "asc"
                    ? query.OrderBy(p => p.Title)
                    : query.OrderByDescending(p => p.Title),
                "price" => queryFilter.OrderBy.ToLower() == "asc"
                    ? query.OrderBy(p => p.Price)
                    : query.OrderByDescending(p => p.Price),
                _ => queryFilter.OrderBy.ToLower() == "asc"
                    ? query.OrderBy(p => p.Id)
                    : query.OrderByDescending(p => p.Id)
            };

            var products = await query
                .Skip((queryFilter.Page - 1) * queryFilter.PageSize)
                .Take(queryFilter.PageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = queryFilter.Page,
                PageSize = queryFilter.PageSize,
                Items = products
            };

            return Ok(response);
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
