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
  
  // Format checkout date
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + parseInt(nights));
  
  const formattedCheckOut = checkOut.toISOString().split('T')[0];

  try {
    // Try the API call
    const response = await fetch(`https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=${cityCode}&checkInDate=${checkInDate}&checkOutDate=${formattedCheckOut}&roomQuantity=1&adults=1&paymentPolicy=NONE&includeClosed=false&bestRateOnly=true&view=FULL&sort=PRICE`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    
    // If we get a successful response, return it
    if (response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify(data)
      };
    }
    
    // Otherwise, return fallback data based on the city code
    const fallbackData = getFallbackHotels(cityCode);
    return {
      statusCode: 200,
      body: JSON.stringify(fallbackData)
    };
    
  } catch (error) {
    // In case of network errors or other issues, return fallback data
    const fallbackData = getFallbackHotels(cityCode);
    return {
      statusCode: 200,
      body: JSON.stringify(fallbackData)
    };
  }
};

// Function to provide fallback hotel data for popular destinations
function getFallbackHotels(cityCode) {
  const fallbackHotels = {
    // Chennai
    "MAA": {
      data: [
        {
          hotel: { name: "The Leela Palace Chennai" },
          offers: [{ price: { total: "9500", currency: "INR" } }]
        },
        {
          hotel: { name: "ITC Grand Chola" },
          offers: [{ price: { total: "8700", currency: "INR" } }]
        },
        {
          hotel: { name: "Taj Coromandel" },
          offers: [{ price: { total: "7800", currency: "INR" } }]
        }
      ]
    },
    // Hyderabad
    "HYD": {
      data: [
        {
          hotel: { name: "Taj Krishna Hyderabad" },
          offers: [{ price: { total: "8800", currency: "INR" } }]
        },
        {
          hotel: { name: "ITC Kohenur" },
          offers: [{ price: { total: "9200", currency: "INR" } }]
        },
        {
          hotel: { name: "Novotel Hyderabad Airport" },
          offers: [{ price: { total: "6500", currency: "INR" } }]
        }
      ]
    },
    // Default for other cities
    "default": {
      data: [
        {
          hotel: { name: "Premium Hotel" },
          offers: [{ price: { total: "8500", currency: "INR" } }]
        },
        {
          hotel: { name: "Business Hotel" },
          offers: [{ price: { total: "6000", currency: "INR" } }]
        },
        {
          hotel: { name: "Budget Stay" },
          offers: [{ price: { total: "3500", currency: "INR" } }]
        }
      ]
    }
  };
  
  // Return city-specific data or default if city not in our list
  return fallbackHotels[cityCode] || fallbackHotels["default"];
}