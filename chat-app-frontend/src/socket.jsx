// socket.jsx
import { io } from 'socket.io-client';

const socket = io("https://chatme-production-6ae4.up.railway.app/", {
  transports: ['websocket'],
});

export default socket;
