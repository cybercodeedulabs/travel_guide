// netlify/functions/cityLookup.js
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

  const { cityName, accessToken } = bodyData;

  try {
    const response = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?keyword=${encodeURIComponent(cityName)}&subType=CITY`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch city code', details: error.message })
    };
  }
};