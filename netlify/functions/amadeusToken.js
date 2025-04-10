exports.handler = async function(event, context) {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  try {
    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    });

    const data = await response.json();

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ access_token: data.access_token })
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch token', details: error.message })
    };
  }
};
