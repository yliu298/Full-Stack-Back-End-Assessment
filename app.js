const express = require('express');
const connectDB = require('./db');
const logger = require('morgan');
const { join } = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const colors = require('colors');
const { notFound, errorHandler } = require('./middleware/error');
const authRouter = require('./routes/auth');
const conversationRouter = require('./routes/conversation');
const tweetRouter = require('./routes/tweet');
const socketio = require('socket.io');
const socketCookieParser = require('./utils/socketCookieParser');

const { json, urlencoded } = express;
require('dotenv').config();
connectDB();
const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

let connectedUsers = [];
const addUser = (email, socketId) => {
  const user = connectedUsers.find((u) => u.email === email);
  if (!user) {
    connectedUsers.push({ email, socketId });
  } else {
    user.socketId = socketId;
  }
};

const removeUser = (socketId) => {
  connectedUsers = connectedUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (email) => {
  return connectedUsers.find((user) => user.email === email);
};

io.on('connection', (socket) => {
  let cookies = socketCookieParser(socket.handshake.headers.cookie);
  try {
    let verifiedToken = jwt.verify(cookies.token, process.env.JWT_SECRET);
    console.log('connected - verifiedToken', verifiedToken);
  } catch (err) {
    socket.disconnect();
    console.log('invalid token - socket disconnected');
  }

  // add user to logged in
  socket.on('USER_LOGIN', (data) => {
    addUser(data, socket.id);
    io.to(socket.id).emit('loggedin');
    io.emit('GET_USERS', connectedUsers);
  });

  socket.on('SEND_MESSAGE', ({ receiver, conversationId, message }) => {
    const receiverId = getUser(receiver);
    if (receiverId) {
      io.to(receiverId.socketId).emit('GET_MESSAGE', { conversationId, message });
    }
  });

  socket.on('disconnect', () => {
    // remove user from logged in
    removeUser(socket.id);
    io.emit('GET_USERS', connectedUsers);
  });
});

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/auth', authRouter);
app.use('/conversation', conversationRouter);
app.use('/tweet', tweetRouter);

app.use(notFound);
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server };
