const socket = io('http://localhost:3000'); // Verbinde mit dem Backend
const map = L.map('map').setView([13.7563, 100.5018], 12); // Bangkok zentrieren
const notifications = document.getElementById('notifications'); // Benachrichtigungscontainer

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const driverMarkers = {}; // Speichert Marker der Fahrer
let userDestination = ''; // Zieladresse

// Aktualisiere die Zieladresse aus der Suchzeile
const searchBar = document.getElementById('search-bar');
searchBar.addEventListener('input', () => {
  userDestination = searchBar.value;
});

// Fahrer buchen
function bookDriver(driverId) {
  if (!userDestination) {
    addNotification('Please enter a destination address before booking.', 'error');
    return;
  }

  const userLocation = 'Lat: 13.7563, Lng: 100.5018'; // Beispiel: Aktuelle Position des Nutzers
  socket.emit('bookDriver', { userId: 'user123', driverId, userLocation, userDestination }, (response) => {
    const type = response.message.includes('successfully') ? 'success' : 'error';
    addNotification(response.message, type);
  });
}

// Fahrer auf der Karte anzeigen
function renderDriversOnMap(drivers) {
  drivers.forEach(driver => {
    if (!driverMarkers[driver.id]) {
      // Neuen Marker erstellen
      const marker = L.marker(driver.location.split(', ').map(Number)).addTo(map);
      marker.bindPopup(`
        <strong>${driver.name}</strong><br>
        Status: ${driver.available ? 'Available' : 'Booked'}<br>
        <button onclick="bookDriver(${driver.id})" ${!driver.available ? 'disabled' : ''}>
          ${driver.available ? 'Book this driver' : 'Unavailable'}
        </button>
      `);
      driverMarkers[driver.id] = marker;
    } else {
      // Existierenden Marker aktualisieren
      const marker = driverMarkers[driver.id];
      marker.setPopupContent(`
        <strong>${driver.name}</strong><br>
        Status: ${driver.available ? 'Available' : 'Booked'}<br>
        <button onclick="bookDriver(${driver.id})" ${!driver.available ? 'disabled' : ''}>
          ${driver.available ? 'Book this driver' : 'Unavailable'}
        </button>
      `);
    }

    // Gebuchte Fahrer entfernen
    if (!driver.available) {
      map.removeLayer(driverMarkers[driver.id]);
      delete driverMarkers[driver.id];
    }
  });
}

// Lausche auf Hinzufügen neuer Fahrer
socket.on('driverAdded', (newDriver) => {
    addNotification(`${newDriver.name} is now available!`, 'success');
  
    // Neuen Fahrer zur Karte hinzufügen
    const marker = L.marker(newDriver.location.split(', ').map(Number)).addTo(map);
    marker.bindPopup(`
      <strong>${newDriver.name}</strong><br>
      Status: Available<br>
      <button onclick="bookDriver(${newDriver.id})">
        Book this driver
      </button>
    `);
  
    driverMarkers[newDriver.id] = marker;
  });
  

// Füge eine Benachrichtigung hinzu
function addNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerText = message;

  notifications.appendChild(notification);

  // Entferne die Benachrichtigung nach 5 Sekunden
  setTimeout(() => {
    notifications.removeChild(notification);
  }, 10000);
}

// Lausche auf Buchungsbenachrichtigungen
socket.on('driverBooked', (booking) => {
  const message = `${booking.driverName} is booked for destination: ${booking.userDestination}`;
  addNotification(message, 'success');
});

// Erhalte Updates der Fahrer vom Backend
socket.on('drivers', (drivers) => {
  renderDriversOnMap(drivers);
});
