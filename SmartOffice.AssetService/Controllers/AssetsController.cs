using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOffice.AssetService.Data;
using SmartOffice.AssetService.Models;

namespace SmartOffice.AssetService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssetsController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public AssetsController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Asset>>> GetAssets()
        {
            var assets = await _mongoDbService.GetAllAsync();

            return Ok(assets);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Asset>> CreateAsset(Asset asset)
        {
            if (string.IsNullOrWhiteSpace(asset.Name) ||
                string.IsNullOrWhiteSpace(asset.Type))
            {
                return BadRequest("Name and type are required.");
            }

            var createdAsset = await _mongoDbService.CreateAsync(asset);

            return Created(
                $"/api/assets/{createdAsset.Id}",
                createdAsset
            );
        }
    }
}