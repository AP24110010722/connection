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

// Queue for matching and list for online status
let waitingUsers = []; 
let onlineUsers = []; // NEW: Track all active connections

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // NEW: HANDLE ONLINE STATUS
  socket.on("user_joined", (userData) => {
    const user = { 
      id: socket.id, 
      name: userData.name || "Anonymous", 
      status: "online" 
    };
    onlineUsers.push(user);
    // Broadcast the updated list to everyone so the "Online Tab" updates
    io.emit("online_users_update", onlineUsers);
  });

  // HANDLE MATCHING REQUESTS
  socket.on("find_connection", (userData) => {
    if (waitingUsers.length > 0) {
      const partner = waitingUsers.shift();
      const matchTime = new Date().toISOString();

      // Start with "Hidden Heart" as the name until someone reveals
      io.to(socket.id).emit("match_found", {
        partnerId: partner.id,
        partnerName: "Hidden Heart",
        matchTime
      });

      io.to(partner.id).emit("match_found", {
        partnerId: socket.id,
        partnerName: "Hidden Heart",
        matchTime
      });

      console.log(`Matched ${socket.id} with ${partner.id}`);
    } else {
      const newUser = {
        id: socket.id,
        name: userData.name || "A Kind Soul",
        joinedAt: Date.now()
      };
      waitingUsers.push(newUser);
      socket.emit("waiting", { 
        message: "Looking for a heart to connect with...",
        queuePosition: waitingUsers.length 
      });
    }
  });

  // NEW: HANDLE NAME REVEAL
  socket.on("reveal_name", ({ to, myName }) => {
    // Relay your real name only to your partner
    io.to(to).emit("partner_name_revealed", { name: myName });
  });

  // HANDLE REAL-TIME MESSAGING
  socket.on("send_message", ({ to, text }) => {
    io.to(to).emit("receive_message", {
      senderId: socket.id,
      text: text,
      timestamp: new Date().toISOString()
    });
  });

  // HANDLE TYPING INDICATORS
  socket.on("typing", ({ to, isTyping }) => {
    io.to(to).emit("partner_typing", { isTyping });
  });

  // HANDLE DISCONNECTS
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Cleanup both lists
    waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
    onlineUsers = onlineUsers.filter(u => u.id !== socket.id);
    
    // Update the online tab for everyone else
    io.emit("online_users_update", onlineUsers);
    
    socket.broadcast.emit("partner_disconnected", { partnerId: socket.id });
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`
❤️  HeartBridge Socket Server Running!
------------------------------------
Listening on: http://localhost:${PORT}
Online Tracking & Name Reveal Enabled.
  `);
});