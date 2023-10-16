const apiBaseUrl = 'http://localhost:3000/api/v1/flightplan/';

const username = 'admin';
const password = 'P@ssw0rd';

async function getAllFlightPlans() {
  const base64Credentials = btoa(`${username}:${password}`);
  const apiResponse = await fetch(apiBaseUrl, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${base64Credentials}`,
    },
  });

  if (apiResponse.status !== 200) {
    alert(apiResponse.status);
  }

  const apiData = await apiResponse.json();
  let html = '';
  apiData.forEach((flightPlan) => {
    html += `<div class="card mb-5">
      <div class="card-header container-fluid">
        <div class="row">
          <div class="col-md-10">
            <h5>${flightPlan.flight_type} flight plan from ${flightPlan.departing_airport} to ${
      flightPlan.arrival_airport
    }</h5>
          </div>
          <div class="col-md-2 float-right">
            <button class="btn btn-danger" style="margin-left: 1em"
            onclick="deleteFlightPlan('${flightPlan.flight_plan_id}')">Delete</button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="row m-3 mb-4">
          <div class="col-3">
            <h6>Flight Type:</h6>${flightPlan.flight_type}
          </div>
          <div class="col-3">
            <h6>Aircraft Identification:</h6>${flightPlan.aircraft_identification}
          </div>
          <div class="col-3">
            <h6>Aircraft Type:</h6>${flightPlan.aircraft_type}
          </div>
          <div class="col-3">
            <h6>Fuel on Board:</h6>${flightPlan.fuel_hours} hours ${flightPlan.fuel_minutes}
          </div>
        </div>
        <div class="row m-3 mb-4">
          <div class="col-3">
            <h6>Filed Altitude:</h6>${flightPlan.altitude} feet
          </div>
          <div class="col-3">
            <h6>Filed Airspeed:</h6>${flightPlan.airspeed} knots
          </div>
          <div class="col-3">
            <h6>Departure Time:</h6>${new Date(flightPlan.departure_time).toLocaleString()}
          </div>
          <div class="col-3">
            <h6>Estimated Arrival Time:</h6>${new Date(flightPlan.estimated_arrival_time).toLocaleString()}
          </div>
        </div>
        <div class="row m-3 mb-4">
          <div class="col-12"><h6>Route:</h6>${flightPlan.route}</div>
        </div>
        <div class="row m-3 mb-4">
          <div class="col-12"><h6>Remarks:</h6>${flightPlan.remarks}</div>
        </div>
      </div>
      <div class="card-footer text-muted">
      Flight Plan Id: ${flightPlan.flight_plan_id}
      </div>
    </div>`;

    document.getElementById('flight_plan_list').innerHTML = html;
  });
}

async function deleteFlightPlan(flightPlanId) {
  const base64Credentials = btoa(`${username}:${password}`);
  const apiResponse = await fetch(`${apiBaseUrl}${flightPlanId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Basic ${base64Credentials}`,
    },
  });

  if (apiResponse.status !== 200) {
    alert(apiResponse.status);
  }
}

async function loadFlightPlan() {
  const flightPlanId = document.getElementById('flightPlanId').value;
  const base64Credentials = btoa(`${username}:${password}`);
  const apiResponse = await fetch(`${apiBaseUrl}${flightPlanId}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${base64Credentials}`,
    },
  });

  if (apiResponse.status !== 200) {
    alert(apiResponse.status);
  }

  const apiData = await apiResponse.json();

  document.getElementById('tailNumber').value = apiData.aircraft_identification;
  document.getElementById('aircraftType').value = apiData.aircraft_type;
  document.getElementById('airspeed').value = apiData.airspeed;
  document.getElementById('altitude').value = apiData.altitude;
  document.getElementById('paxOnBoard').value = apiData.number_onboard;
  document.getElementById('departureTime').value = apiData.departure_time.substring(
    0,
    apiData.departure_time.length - 1
  );
  document.getElementById('arrivalTime').value = apiData.estimated_arrival_time.substring(
    0,
    apiData.estimated_arrival_time.length - 1
  );
  document.getElementById('departAirport').value = apiData.departing_airport;
  document.getElementById('arriveAirport').value = apiData.arrival_airport;
  document.getElementById('route').value = apiData.route;
  document.getElementById('remarks').value = apiData.remarks;
  document.getElementById('fuelHours').value = apiData.fuel_hours;
  document.getElementById('fuelMinutes').value = apiData.fuel_minutes;
  document.getElementById('paxOnBoard').value = apiData.number_onboard;

  if (apiData.flight_type === 'VFR') {
    document.getElementById('inlineVFR').checked = true;
  } else if (apiData.flight_type === 'IFR') {
    document.getElementById('inlineIFR').checked = true;
  }

  document.getElementById('fileButton').hidden = true;
  document.getElementById('updateButton').hidden = false;
}

async function updateFlightPlan() {
  let selectedFlightType = 'unknown';
  if (document.getElementById('inlineVFR').checked) {
    selectedFlightType = 'VFR';
  } else if (document.getElementById('inlineIFR').checked) {
    selectedFlightType = 'IFR';
  }

  const base64Credentials = btoa(`${username}:${password}`);
  const apiResponse = await fetch(apiBaseUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flight_plan_id: document.getElementById('flightPlanId').value,
      altitude: Number(document.getElementById('altitude').value),
      aircraft_identification: document.getElementById('tailNumber').value,
      aircraft_type: document.getElementById('aircraftType').value,
      airspeed: Number(document.getElementById('airspeed').value),
      arrival_airport: document.getElementById('arriveAirport').value,
      flight_type: selectedFlightType,
      departing_airport: document.getElementById('departAirport').value,
      departure_time: new Date(document.getElementById('departureTime').value).toISOString(),
      estimated_arrival_time: new Date(document.getElementById('arrivalTime').value).toISOString(),
      route: document.getElementById('route').value,
      remarks: document.getElementById('remarks').value,
      fuel_hours: Number(document.getElementById('fuelHours').value),
      fuel_minutes: Number(document.getElementById('fuelMinutes').value),
      number_onboard: Number(document.getElementById('paxOnBoard').value),
    }),
  });

  if (apiResponse.status !== 200) {
    alert(apiResponse.status);
  }
}

async function fileFlightPlan() {
  let selectedFlightType = 'unknown';
  if (document.getElementById('inlineVFR').checked) {
    selectedFlightType = 'VFR';
  } else if (document.getElementById('inlineIFR').checked) {
    selectedFlightType = 'IFR';
  }

  const base64Credentials = btoa(`${username}:${password}`);
  const apiResponse = await fetch(`${apiBaseUrl}file`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flight_plan_id: document.getElementById('flightPlanId').value,
      altitude: Number(document.getElementById('altitude').value),
      aircraft_identification: document.getElementById('tailNumber').value,
      aircraft_type: document.getElementById('aircraftType').value,
      airspeed: Number(document.getElementById('airspeed').value),
      arrival_airport: document.getElementById('arriveAirport').value,
      flight_type: selectedFlightType,
      departing_airport: document.getElementById('departAirport').value,
      departure_time: new Date(document.getElementById('departureTime').value).toISOString(),
      estimated_arrival_time: new Date(document.getElementById('arrivalTime').value).toISOString(),
      route: document.getElementById('route').value,
      remarks: document.getElementById('remarks').value,
      fuel_hours: Number(document.getElementById('fuelHours').value),
      fuel_minutes: Number(document.getElementById('fuelMinutes').value),
      number_onboard: Number(document.getElementById('paxOnBoard').value),
    }),
  });

  if (apiResponse.status !== 200) {
    alert(apiResponse.status);
  }
}
