using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AfricasTalkingCS;

namespace CrimePredictionAlertSystem.Core.Services
{
    public class SmsService
    {
        private readonly AfricasTalkingGateway _gateway;

        public SmsService()
        {
            string username = "Mthokozisi";
            string apiKey = "atsk_31fb36b67f774989013f6539da189f3dd02f034aa91601d087096d4590195becacfc6adc";
            _gateway = new AfricasTalkingGateway(username, apiKey);
        }

        public async Task<string> SendCrimeAlert(string phoneNumber)
        {
            try
            {
                string message = "Crime Alert";
                var results = _gateway.SendMessage(phoneNumber, message);
                return $"Sent to {phoneNumber}: {results.Status}";
            }
            catch (AfricasTalkingGatewayException ex)
            {
                return $"Failed to send: {ex.Message}";
            }
        }
    }
}
