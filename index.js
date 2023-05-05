const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: process.env.FRONT_END_DEPLOYMENT,
  },
});

async function saveNewMessage(text, from, to) {
  await prisma.message.create({
    data: {
      text,
      from,
      to,
    },
  });
}

io.use((socket, next) => {
  socket.userId = socket.handshake.auth.userId;
  socket.username = socket.handshake.auth.username;
  next();
});

io.on("connection", (socket) => {
  socket.join(socket.username);

  socket.on("send message", ({ text, to }) => {
    const message = {
      text,
      from: socket.username,
      to,
    };
    socket.to(to).to(socket.username).emit("send message", message);
    saveNewMessage(text, socket.username, to);
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Listening on http://localhost:${process.env.PORT}/`);
  console.log("CTRL/CMD + C to stop the server");
});
