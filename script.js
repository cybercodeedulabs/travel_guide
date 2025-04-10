document.getElementById('travelForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Get form values
  const source = document.getElementById('source').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const budget = parseFloat(document.getElementById('budget').value.trim());
  const currency = document.getElementById('currency').value;

  // Validate inputs
  if (!source || !destination || isNaN(budget)) {
    alert('Please fill all fields properly.');
    return;
  }

  // Generate mock data
  const travelModes = ['Train', 'Bus', 'Flight', 'Cab'];
  const mode = travelModes[Math.floor(Math.random() * travelModes.length)];

  const highlights = [
    `Explore cultural sites between ${source} and ${destination}`,
    `Stopover in key city en route for a quick tour`,
    `Visit famous local eateries and viewpoints`
  ];

  const hotels = [
    { name: 'Budget Inn', rating: 4.2, safety: 'High' },
    { name: 'StayWell Suites', rating: 3.8, safety: 'Medium' },
    { name: 'Comfort Rooms', rating: 4.5, safety: 'High' }
  ];

  const recommendedHotel = hotels[Math.floor(Math.random() * hotels.length)];

  // Format output
  const output = `
    <h3>Suggested Travel Plan (${currency} ${budget})</h3>
    <p><strong>From:</strong> ${source}</p>
    <p><strong>To:</strong> ${destination}</p>
    <p><strong>Mode of Travel:</strong> ${mode}</p>
    <p><strong>Route Highlights:</strong></p>
    <ul>${highlights.map(h => `<li>${h}</li>`).join('')}</ul>
    <p><strong>Recommended Hotel:</strong> ${recommendedHotel.name} (Rating: ${recommendedHotel.rating}/5, Safety: ${recommendedHotel.safety})</p>
  `;

  document.getElementById('output').innerHTML = output;
});
