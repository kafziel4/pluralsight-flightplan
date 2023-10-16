using System.Net;
using FlightPlanApi.Data;
using FlightPlanApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace FlightPlanApi.Controllers
{
    [Route("api/v1/flightplan")]
    [ApiController]
    [Authorize]
    public class FlightPlanController : ControllerBase
    {
        private readonly IDatabaseAdapter _database;

        public FlightPlanController(IDatabaseAdapter database)
        {
            _database = database;
        }

        [HttpGet]
        [SwaggerResponse((int)HttpStatusCode.NoContent, "No flight plans have been filed with this system")]
        public async Task<IActionResult> FlightPlanList()
        {
            var flightPlanList = await _database.GetAllFlightPlans();
            if (flightPlanList.Count == 0)
                return NoContent();

            return Ok(flightPlanList);
        }

        [HttpGet("{flightPlanId}")]
        public async Task<IActionResult> GetFlightPlanById(string flightPlanId)
        {
            var flightPlan = await _database.GetFlightPlanById(flightPlanId);
            if (flightPlan.FlightPlanId != flightPlanId)
                return NotFound();

            return Ok(flightPlan);
        }

        /// <summary>
        /// Files a new Flight plan with the system
        /// </summary>
        /// <remarks>
        /// Sample request:
        /// 
        ///     POST /api/v1/flightplan/file
        ///     {
        ///         "aircraft_identification": "N67SVS",
        ///         "aircraft_type": "PA-34 Piper Seneca",
        ///         "airspeed": 128,
        ///         "altitude": 12000,
        ///         "flight_type": "VFR",
        ///         "fuel_hours": 3,
        ///         "fuel_minutes": 41,
        ///         "departure_time": "2022-07-08T00:26:45Z",
        ///         "estimated_arrival_time": "2022-07-08T03:49:45Z",
        ///         "departing_airport": "KBXA",
        ///         "arrival_airport": "KNZY",
        ///         "route": "KBXA JOH J46 DMDUP J46 KNZY",
        ///         "remarks": "",
        ///         "number_onboard": 4
        ///     }
        /// </remarks>
        /// <param name="flightPlan">The flight plan data to be filed.</param>
        /// <response code="400">There is a problem with the flight plan data received by this system</response>
        /// <response code="500">The flight plan is valid but this system cannot process it</response>
        /// <returns></returns>
        [HttpPost("file")]
        public async Task<IActionResult> FileFlightPlan(FlightPlan flightPlan)
        {
            var transactionResult = await _database.FileFlightPlan(flightPlan);
            return transactionResult switch
            {
                TransactionResult.Success => Ok(),
                TransactionResult.BadRequest => BadRequest(),
                _ => Problem()
            };
        }

        [HttpPut]
        public async Task<IActionResult> UpdateFlightPlan(FlightPlan flightPlan)
        {
            var updateResult = await _database.UpdateFlightPlan(flightPlan.FlightPlanId, flightPlan);
            return updateResult switch
            {
                TransactionResult.Success => Ok(),
                TransactionResult.NotFound => NotFound(),
                _ => Problem()
            };
        }

        [HttpDelete]
        [Route("{flightPlanId}")]
        public async Task<IActionResult> DeleteFlightPlan(string flightPlanId)
        {
            var result = await _database.DeleteFlightPlanById(flightPlanId);
            return result ? Ok() : NotFound();
        }

        [HttpGet]
        [Route("airport/departure/{flightPlanId}")]
        public async Task<IActionResult> GetFlightPlanDepartureAirport(string flightPlanId)
        {
            var flightPlan = await _database.GetFlightPlanById(flightPlanId);
            if (flightPlan.FlightPlanId != flightPlanId)
                return NotFound();

            return Ok(flightPlan.DepartureAirport);
        }

        [HttpGet]
        [Route("route/{flightPlanId}")]
        public async Task<IActionResult> GetFlightPlanRoute(string flightPlanId)
        {
            var flightPlan = await _database.GetFlightPlanById(flightPlanId);
            if (flightPlan.FlightPlanId != flightPlanId)
                return NotFound();

            return Ok(flightPlan.Route);
        }

        [HttpGet]
        [Route("time/enroute/{flightPlanId}")]
        public async Task<IActionResult> GetFlightPlanTimeEnroute(string flightPlanId)
        {
            var flightPlan = await _database.GetFlightPlanById(flightPlanId);
            if (flightPlan.FlightPlanId != flightPlanId)
                return NotFound();

            var estimatedTimeEnroute = flightPlan.ArrivalTime - flightPlan.DepartureTime;

            return Ok(estimatedTimeEnroute);
        }
    }
}
