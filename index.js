const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: process.env.FRONT_END_DEPLOYMENT,
  },
});

httpServer.listen(process.env.PORT, () =>
  console.log(`Listening on http://localhost:${process.env.PORT}/`)
);
