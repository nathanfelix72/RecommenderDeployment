using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

[Route("api/recommendations")]
[ApiController]
public class RecommendationController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private const string PythonApiUrl = "http://localhost:5001/recommend"; // Adjust if necessary

    public RecommendationController(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    [HttpPost]
    public async Task<IActionResult> GetRecommendations([FromBody] RecommendationRequest request)
    {
        if (string.IsNullOrEmpty(request.UserId) && string.IsNullOrEmpty(request.ItemId))
        {
            return BadRequest(new { error = "Provide either userId or itemId" });
        }

        var requestBody = JsonSerializer.Serialize(new { userId = request.UserId, itemId = request.ItemId });
        var content = new StringContent(requestBody, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(PythonApiUrl, content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { error = "Failed to fetch Python recommendations" });
            }

            var recommendations = JsonSerializer.Deserialize<RecommendationResponse>(responseString);

            return Ok(new
            {
                collaborative = recommendations.Collaborative,
                content = recommendations.Content,
                azure = new string[0] // Replace with Azure model response
            });
        }
        catch
        {
            return StatusCode(500, new { error = "Error fetching recommendations" });
        }
    }
}

public class RecommendationRequest
{
    public string UserId { get; set; }
    public string ItemId { get; set; }
}

public class RecommendationResponse
{
    public string[] Collaborative { get; set; }
    public string[] Content { get; set; }
}
