const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: process.env.FRONT_END_DEPLOYMENT,
  },
});

async function getUserHistoryByUsername(username) {
  return prisma.userHistory.upsert({
    where: {
      username,
    },
    update: {},
    create: {
      username,
      messagedUsernames: [],
    },
  });
}

async function getMessagesBetweenTwoUsers(firstUsername, secondUsername) {
  return prisma.message.findMany({
    where: {
      OR: [
        {
          from: firstUsername,
          to: secondUsername,
        },
        {
          from: secondUsername,
          to: firstUsername,
        },
      ],
    },
    orderBy: {
      sentAt: "asc",
    },
  });
}

async function saveAndNotifyNewMessagedUser(messagedUsername, socket) {
  const requester = socket.username;

  if (requester === messagedUsername) return;

  getUserHistoryByUsername(requester).then(async (userHistory) => {
    if (!userHistory.messagedUsernames.includes(messagedUsername)) {
      socket.emit("new messaged user", {
        username: messagedUsername,
        messages: [],
      });
      await prisma.userHistory.update({
        where: {
          username: requester,
        },
        data: {
          messagedUsernames: {
            push: messagedUsername,
          },
        },
      });
    }
  });

  getUserHistoryByUsername(messagedUsername).then(async (userHistory) => {
    if (!userHistory.messagedUsernames.includes(requester)) {
      socket.to(messagedUsername).emit("new messaged user", {
        username: requester,
        messages: [],
      });
      await prisma.userHistory.update({
        where: {
          username: messagedUsername,
        },
        data: {
          messagedUsernames: {
            push: requester,
          },
        },
      });
    }
  });
}

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

  let messagedUsers = [];
  getUserHistoryByUsername(socket.username).then((userHistory) => {
    if (userHistory.messagedUsernames.length) {
      userHistory.messagedUsernames.forEach((username) => {
        getMessagesBetweenTwoUsers(socket.username, username)
          .then((messages) => {
            messagedUsers.push({
              username: username,
              messages: messages,
            });
          })
          .then(() => {
            socket.emit("list messaged users", messagedUsers);
          });
      });
    } 
    else {
      socket.emit("list messaged users", []);
    }
  });

  socket.on("new messaged username", (messagedUsername) => {
    saveAndNotifyNewMessagedUser(messagedUsername, socket);
  });

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
