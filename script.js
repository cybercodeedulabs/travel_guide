document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('travelForm');
  form.addEventListener('submit', handleFormSubmit);
});

async function handleFormSubmit(event) {
  event.preventDefault();
  
   const sourceEl = document.getElementById('source');
  if (!sourceEl) {
    console.error("Source input not found in DOM");
    return;
  }

  const source = sourceEl.value;
  console.log(sourceEl); // optional: logs the element if you want to check

  const destination = document.getElementById('destination').value;
  const budget = parseFloat(document.getElementById('budget').value);
  const currency = document.getElementById('currency').value;
  const startDate = document.getElementById('start-date').value;
  const nights = parseInt(document.getElementById('nights').value);

  if (!source || !destination || isNaN(budget) || !currency || !startDate || isNaN(nights)) {
    alert('Please fill in all fields correctly.');
    return;
  }

  const convertedBudget = await convertCurrency(budget, currency, 'USD');
  const travelOptions = await getTravelOptions(source, destination, startDate);
  const hotelSuggestions = await getHotelSuggestions(destination, startDate, nights);

  displayResults(source, destination, budget, currency, convertedBudget, travelOptions, hotelSuggestions);
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

async function getHotelSuggestions(city, checkInDate, nights) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return 'Error retrieving hotel data.';

    const searchURL = `https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=${city}&checkInDate=${checkInDate}&roomQuantity=1&adults=2&paymentPolicy=NONE&includeClosed=false&bestRateOnly=true&view=FULL&sort=PRICE`;

    const hotelRes = await fetch(searchURL, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const hotelData = await hotelRes.json();

    return hotelData.data.slice(0, 3).map(h => {
      return `${h.hotel.name} - ${h.offers[0].price.total} ${h.offers[0].price.currency}`;
    }).join('<br>');
  } catch (error) {
    console.error('Hotel API error:', error);
    return 'Unable to fetch hotel suggestions at the moment.';
  }
}

async function getTravelOptions(source, destination, date) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return 'Error retrieving travel data.';

    const offersURL = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${source}&destinationLocationCode=${destination}&departureDate=${date}&adults=1&nonStop=false&max=3`;

    const offersResponse = await fetch(offersURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const offersData = await offersResponse.json();

    if (offersData.data && offersData.data.length > 0) {
      return offersData.data.map((offer, i) => {
        const itinerary = offer.itineraries[0];
        const segments = itinerary.segments;
        const duration = itinerary.duration.replace('PT', '').toLowerCase();
        const segmentInfo = segments.map(seg => `${seg.departure.iataCode} → ${seg.arrival.iataCode} (${seg.carrierCode})`).join(', ');
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
