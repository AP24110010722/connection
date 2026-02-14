const { Server } = require("socket.io");
const http = require("http");

// 1. Initialize the HTTP server and Socket.io
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Allows your Next.js app to connect
    methods: ["GET", "POST"]
  },
});

// 2. Queue for users waiting for a match
let waitingUsers = []; 

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // HANDLE MATCHING REQUESTS
  socket.on("find_connection", (userData) => {
    // Check if there's someone else waiting
    if (waitingUsers.length > 0) {
      // Pull the first person from the queue
      const partner = waitingUsers.shift();
      
      // Stop the timer for the partner (handled on client, but server confirms match)
      const matchTime = new Date().toISOString();

      // Notify User A (the one who just joined)
      io.to(socket.id).emit("match_found", {
        partnerId: partner.id,
        partnerName: partner.name,
        matchTime
      });

      // Notify User B (the one who was waiting)
      io.to(partner.id).emit("match_found", {
        partnerId: socket.id,
        partnerName: userData.name || "A Kind Soul",
        matchTime
      });

      console.log(`Matched ${socket.id} with ${partner.id}`);
    } else {
      // No one waiting? Add this user to the queue
      const newUser = {
        id: socket.id,
        name: userData.name || "A Kind Soul",
        joinedAt: Date.now()
      };
      waitingUsers.push(newUser);
      
      // Let the client know they are in the queue
      socket.emit("waiting", { 
        message: "Looking for a heart to connect with...",
        queuePosition: waitingUsers.length 
      });
      console.log(`User ${socket.id} added to queue.`);
    }
  });

  // HANDLE REAL-TIME MESSAGING
  socket.on("send_message", ({ to, text }) => {
    // Relay the message directly to the partner's socket ID
    io.to(to).emit("receive_message", {
      senderId: socket.id,
      text: text,
      timestamp: new Date().toISOString()
    });
    console.log(`Message from ${socket.id} to ${to}: ${text}`);
  });

  // HANDLE TYPING INDICATORS (Bonus feature for judges)
  socket.on("typing", ({ to, isTyping }) => {
    io.to(to).emit("partner_typing", { isTyping });
  });

  // HANDLE DISCONNECTS
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove from waiting queue if they leave while searching
    waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
    
    // Inform active partners that the other person left
    // (In a more complex app, you'd track active rooms/pairs)
    socket.broadcast.emit("partner_disconnected", { partnerId: socket.id });
  });
});

// 3. Start the server on Port 3001
const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`
❤️  HeartBridge Socket Server Running!
------------------------------------
Listening on: http://localhost:${PORT}
Managing real-time matches and chat.
  `);
});