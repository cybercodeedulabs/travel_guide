exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' })
    };
  }

  let bodyData;
  try {
    bodyData = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body.' })
    };
  }

  const { cityCode, checkInDate, nights, accessToken } = bodyData;

  try {
    const response = await fetch(`https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=${cityCode}&checkInDate=${checkInDate}&roomQuantity=1&adults=1&paymentPolicy=NONE&includeClosed=false&bestRateOnly=true&view=FULL&sort=PRICE`, {
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch hotel offers', details: error.message })
    };
  }
};
