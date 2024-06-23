const http = require('http');
const socketIo = require('socket.io');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.IO chat room server is running\n');
});
// Attach Socket.IO to the server and enable CORS
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allow specific HTTP methods
    credentials: true
  }
});
let users = [];

// Use CORS middleware
app.use(cors({
  origin: "https://numberonepoker.vercel.app/" // Replace with your client URL
}));

io.on('connection', (socket) => {
  socket.on('joinRoom', (room , username) => {
    socket.join(room);
    users.push({id: socket.id, username: username, room: room, score: 0 })
    const roomUsers = users.filter(el => el.room === room)
    socket.emit('joined', roomUsers);
    socket.to(room).emit('userList', roomUsers);
  });

  socket.on('setScore', ({ room, msg }) => {
    let user = users.find(el => el.id === socket.id)
    if (user) {
      user.score = msg
    }
    socket.emit('setPersonalScore', {score: msg , user: socket.id});
    socket.to(room).emit('userScore', {score: msg , user: socket.id});
  });

  socket.on('action', ({room , action}) => {
    socket.to(room).emit('userAction' , action);
  });

  socket.on('emote', ({room,emote}) => {
    socket.to(room).emit('userEmote' , emote);
  });

  socket.on('checkRoom', (room) => {
    const isValidRoom = users.some(el => el.room === room)
    socket.emit('onRoomCheck', isValidRoom);
  });

  socket.on('disconnect', () => {
    const index = users.findIndex(el => el.id === socket.id)
    if (index !== -1) {
      users.splice(index,1)
    }
    io.emit('userList', users);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
