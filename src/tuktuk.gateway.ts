import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

// Simuliert TukTuk-Fahrer
interface TukTukDriver {
  id: number;
  name: string;
  location: string;
  available: boolean;
}

@WebSocketGateway({ cors: true })
export class TukTukGateway {
  @WebSocketServer()
  server: Server;

  private drivers: TukTukDriver[] = [];

  constructor() {
    this.simulateDrivers();
  }

  private simulateDrivers() {
    for (let i = 1; i <= 200; i++) {
      this.drivers.push({
        id: i,
        name: `Driver ${i}`,
        location: `${13.7 + Math.random() * 0.2}, ${100.4 + Math.random() * 0.2}`, // Zufällige Position in Bangkok
        available: true,
      });
    }
  
    setInterval(() => {
      this.server.emit('drivers', this.drivers);
    }, 5000);
  }
  

  @SubscribeMessage('bookDriver')
  handleBookDriver(
    @MessageBody() data: { userId: string; driverId: number; userLocation: string; userDestination: string },
  ) {
    const driver = this.drivers.find(d => d.id === data.driverId);
    if (driver && driver.available) {
      driver.available = false;
  
      const bookingMessage = {
        driverId: driver.id,
        driverName: driver.name,
        userId: data.userId,
        userLocation: data.userLocation,
        userDestination: data.userDestination,
        message: `You have been booked by ${data.userId} to ${data.userDestination}.`,
      };
  
      // Benachrichtige den gebuchten Fahrer
      this.server.emit(`driver-notification-${driver.id}`, bookingMessage);
  
      // Informiere alle Clients über die Buchung
      this.server.emit('driverBooked', bookingMessage);
  
      return { message: `Driver ${driver.name} booked successfully to ${data.userDestination}.` };
    } else {
      return { message: 'Driver is not available.' };
    }
  }
  

  @SubscribeMessage('registerDriver')
  handleRegisterDriver(@MessageBody() data: { name: string; location: string }) {
    const newDriver = {
      id: this.drivers.length + 1,
      name: data.name || `Driver ${this.drivers.length + 1}`,
      location: data.location,
      available: true,
    };
  
    this.drivers.push(newDriver);
    this.server.emit('driverAdded', newDriver); // Informiere alle Clients über den neuen Fahrer
  
    return { message: `Driver ${newDriver.name} registered at location ${newDriver.location}.` };
  }
  
  
  
}
