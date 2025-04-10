exports.handler = async function (event, context) {
  try {
    const { origin, destination, date, accessToken } = JSON.parse(event.body);

    const offersURL = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&adults=1&nonStop=false&max=3`;

    const response = await fetch(offersURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Flight Search Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch flight offers', details: error.message })
    };
  }
};
