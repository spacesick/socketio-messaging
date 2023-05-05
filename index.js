const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: process.env.FRONT_END_DEPLOYMENT,
  },
});

io.use((socket, next) => {
  socket.userId = socket.handshake.auth.userId;
  socket.username = socket.handshake.auth.username;
  next();
});

io.on("connection", (socket) => {
  socket.join(socket.username);
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Listening on http://localhost:${process.env.PORT}/`);
  console.log("CTRL/CMD + C to stop the server");
});
