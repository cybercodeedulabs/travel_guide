document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('travelForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  } else {
    console.error("Form with ID 'travelForm' not found.");
  }
});

async function handleFormSubmit(event) {
  event.preventDefault();

  const sourceEl = document.getElementById('source');
  if (!sourceEl) {
    console.error("Source input not found in DOM");
    return;
  }

  const source = sourceEl.value.trim();
  const destination = document.getElementById('destination').value.trim();
  const budget = parseFloat(document.getElementById('budget').value);
  const currency = document.getElementById('currency').value;
  const startDate = document.getElementById('start-date').value;
  const nights = parseInt(document.getElementById('nights').value);

  if (!source || !destination || isNaN(budget) || !currency || !startDate || isNaN(nights)) {
    alert('Please fill in all fields correctly.');
    return;
  }

  const sourceCode = await getCityCode(source);
  const destinationCode = await getCityCode(destination);

  if (!sourceCode || !destinationCode) {
    alert('Could not resolve one or both city names to valid IATA codes. Please use known cities.');
    return;
  }

  const convertedBudget = await convertCurrency(budget, currency, 'USD');
  const travelOptions = await getTravelOptions(sourceCode, destinationCode, startDate);
  const hotelSuggestions = await getHotelSuggestions(destinationCode, startDate, nights);

  displayResults(source, destination, budget, currency, convertedBudget, travelOptions, hotelSuggestions);
}

async function getCityCode(cityName) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;

    const response = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?keyword=${encodeURIComponent(cityName)}&subType=CITY`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await response.json();
    return data?.data?.[0]?.iataCode || null;
  } catch (error) {
    console.error('City code fetch error:', error);
    return null;
  }
}

async function convertCurrency(amount, from, to) {
  if (from === to) return amount;

  try {
    const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
    const data = await response.json();
    return data.rates[to];
  } catch (error) {
    console.error('Currency conversion error:', error);
    return amount;
  }
}

async function getAccessToken() {
  try {
    const response = await fetch('/.netlify/functions/amadeusToken');
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
}

async function getHotelSuggestions(cityCode, checkInDate, nights) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return 'Error retrieving hotel data.';

    const response = await fetch('/.netlify/functions/hotelSearch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cityCode, checkInDate, nights, accessToken })
    });

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return 'No hotels found.';
    }

    return data.data.slice(0, 3).map(h => {
      const offer = h.offers?.[0];
      const price = offer?.price?.total || 'N/A';
      const currency = offer?.price?.currency || '';
      return `${h.hotel.name} - ${price} ${currency}`;
    }).join('<br>');

  } catch (error) {
    console.error('Hotel API error:', error);
    return 'Unable to fetch hotel suggestions at the moment.';
  }
}

async function getTravelOptions(origin, destination, date) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return 'Error retrieving travel data.';

    const response = await fetch('/api/flightSearch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, date, accessToken })
    });

    const result = await response.json();

    if (result.data && result.data.length > 0) {
      return result.data.map((offer, i) => {
        const itinerary = offer.itineraries[0];
        const segments = itinerary.segments;
        const duration = itinerary.duration.replace('PT', '').toLowerCase();
        const segmentInfo = segments.map(seg =>
          `${seg.departure.iataCode} → ${seg.arrival.iataCode} (${seg.carrierCode})`
        ).join(', ');
        return `Option ${i + 1}: ${segmentInfo}, Duration: ${duration}`;
      }).join('<br><br>');
    } else {
      return 'No travel options found for the selected route and date.';
    }

  } catch (error) {
    console.error('Error fetching travel options:', error);
    return 'Error fetching travel options.';
  }
}

function displayResults(source, destination, budget, currency, convertedBudget, travelOptions, hotelSuggestions) {
  const resultsDiv = document.getElementById('output');
  resultsDiv.innerHTML = `
    <h3>Travel Plan from ${source} to ${destination}</h3>
    <p><strong>Your Budget:</strong> ${budget.toLocaleString()} ${currency}</p>
    <p><strong>Converted Budget in USD:</strong> $${convertedBudget.toFixed(2)}</p>
    <p><strong>Travel Options:</strong><br>${travelOptions}</p>
    <p><strong>Hotel Suggestions:</strong><br>${hotelSuggestions}</p>
  `;
}
