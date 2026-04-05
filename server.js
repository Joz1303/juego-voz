console.log("SERVER.JS CARGADO");

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

const rooms = {};

io.on("connection", socket => {
  console.log("Usuario conectado:", socket.id);

  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);
    socket.roomCode = roomCode;

    if (!rooms[roomCode]) rooms[roomCode] = new Set();
    rooms[roomCode].add(socket.id);

    const others = [...rooms[roomCode]].filter(id => id !== socket.id);
    socket.emit("room-users", others);
    socket.to(roomCode).emit("user-joined", socket.id);

    console.log(`Sala ${roomCode}: ${rooms[roomCode].size} jugadores`);
  });

  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice", ({ to, candidate }) => {
    io.to(to).emit("ice", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    const code = socket.roomCode;
    if (code && rooms[code]) {
      rooms[code].delete(socket.id);
      if (rooms[code].size === 0) delete rooms[code];
      socket.to(code).emit("user-left", socket.id);
    }
    console.log("Usuario desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
http.listen(PORT, () => {
  console.log(`Servidor WebRTC en http://localhost:${PORT}`);
});
