const { Server } = require("socket.io");
const http = require("http");

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

let waitingUsers = []; 
let onlineUsers = []; // Tracks unique users globally

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // UNIQUE USER JOIN: Prevents duplicates by filtering by externalId (Clerk ID)
  socket.on("user_joined", (userData) => {
    // Remove existing connections for this specific user ID
    onlineUsers = onlineUsers.filter(u => u.externalId !== userData.externalId);
    
    const user = { 
      id: socket.id, 
      externalId: userData.externalId, 
      name: userData.name || "Anonymous", 
      status: "online" 
    };
    onlineUsers.push(user);
    io.emit("online_users_update", onlineUsers);
  });

  // SCHEDULED MESSAGE LOGIC: Uses a server-side timer
  socket.on("schedule_message", ({ to, text, delayMs }) => {
    console.log(`Scheduling message for partner ${to} in ${delayMs}ms`);
    setTimeout(() => {
      io.to(to).emit("receive_message", {
        senderId: "System-Schedule",
        text: `📅 Scheduled: ${text}`,
        timestamp: new Date().toISOString()
      });
    }, delayMs);
  });

  // MATCHING LOGIC
  socket.on("find_connection", (userData) => {
    if (waitingUsers.length > 0) {
      const partner = waitingUsers.shift();
      const matchTime = new Date().toISOString();

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
    } else {
      waitingUsers.push({ 
        id: socket.id, 
        externalId: userData.externalId, 
        name: userData.name 
      });
    }
  });

  socket.on("reveal_name", ({ to, myName }) => {
    io.to(to).emit("partner_name_revealed", { name: myName });
  });

  socket.on("send_message", ({ to, text }) => {
    io.to(to).emit("receive_message", {
      senderId: socket.id,
      text: text,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
    onlineUsers = onlineUsers.filter(u => u.id !== socket.id);
    io.emit("online_users_update", onlineUsers);
    socket.broadcast.emit("partner_disconnected", { partnerId: socket.id });
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => console.log(`Production Server running on ${PORT}`));