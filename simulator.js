const io = require('socket.io-client');
const socket = io('http://localhost:3000');

// Generiere zufällige Positionen in Bangkok
function generateRandomLocation() {
  const lat = 13.7 + Math.random() * 0.2; // Latitude im Bereich Bangkok
  const lng = 100.4 + Math.random() * 0.2; // Longitude im Bereich Bangkok
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

// Registriere einen neuen Fahrer
function registerDriver() {
  const driverName = `Driver ${Math.floor(Math.random() * 1000)}`; // Zufälliger Name
  const driverLocation = generateRandomLocation();

  socket.emit('registerDriver', { name: driverName, location: driverLocation }, (response) => {
    console.log(response.message);
  });
}

// Fahrer alle 5 Sekunden registrieren
setInterval(registerDriver, 1000);
