console.log("SERVER.JS CARGADO");
 
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
 
app.use(express.static("public"));
 
io.on("connection", socket => {
  console.log("Usuario conectado");
 
  socket.on("offer", data => socket.broadcast.emit("offer", data));
  socket.on("answer", data => socket.broadcast.emit("answer", data));
  socket.on("ice", data => socket.broadcast.emit("ice", data));
});
 
const PORT = process.env.PORT || 4000;
http.listen(PORT, () => {
  console.log(`Servidor WebRTC en http://localhost:${PORT}`);
});
