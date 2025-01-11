const io = require('socket.io-client');
const socket = io('http://localhost:3000');

// Fahrer alle 5 Sekunden hinzufügen
setInterval(() => {
  socket.emit('addDriver', {}, (response) => {
    console.log(response.message);
  });
}, 1000);
