using CrimePredictionAlertSystem.Core.Dto;
using CrimePredictionAlertSystem.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CrimePredictionAlertSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Sms_Controller : Controller
    {

        private readonly SmsService _smsService;

        [AllowAnonymous]
        [HttpGet]
        public IActionResult Index()
        {
            return Ok("Sms Controller is working");
        }

        public Sms_Controller(SmsService smsService)
        {
            _smsService = smsService;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Send([FromBody] SmsRequest request)
        {
            var result = await _smsService.SendCrimeAlert(request.PhoneNumber!);
            return Ok(result);
        }
    }
}
