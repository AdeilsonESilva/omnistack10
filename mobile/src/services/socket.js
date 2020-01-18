import socketio from "socket.io-client";

const socket = socketio("http://localhost:3333", {
  autoConnect: false
});

const connect = (latitude, longitude, techs) => {
  socket.io.opts.query = {
    latitude,
    longitude,
    techs
  };

  socket.connect();
};

const disconnect = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

const subscribeToNewDevs = subscribeFunction => {
  socket.on('new-dev', subscribeFunction);
};

export { connect, disconnect, subscribeToNewDevs };
