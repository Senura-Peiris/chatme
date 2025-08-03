import { io } from 'socket.io-client';

const socket = io("https://chatme-application.up.railway.app");

export default socket;
