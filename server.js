const { Server } = require("socket.io");
const http = require("http");

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

let waitingUsers = []; 
let onlineUsers = []; 

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("user_joined", (userData) => {
    onlineUsers = onlineUsers.filter(u => u.externalId !== userData.externalId);
    const user = { 
      id: socket.id, 
      externalId: userData.externalId, 
      name: userData.name || "Anonymous", 
      gender: userData.gender, // Store gender for matching
      status: "online" 
    };
    onlineUsers.push(user);
    io.emit("online_users_update", onlineUsers);
  });

  socket.on("schedule_message", ({ to, text, delayMs }) => {
    setTimeout(() => {
      io.to(to).emit("receive_message", {
        senderId: "System-Schedule",
        text: `📅 Scheduled: ${text}`,
        timestamp: new Date().toISOString()
      });
    }, delayMs);
  });

  socket.on("find_connection", (userData) => {
    // Look for a partner of the OPPOSITE gender
    const partnerIndex = waitingUsers.findIndex(
      (u) => u.gender !== userData.gender && u.externalId !== userData.externalId
    );

    if (partnerIndex !== -1) {
      const partner = waitingUsers.splice(partnerIndex, 1)[0];
      
      io.to(socket.id).emit("match_found", { 
        partnerId: partner.id, 
        partnerName: "Hidden Heart", 
        partnerExternalId: partner.externalId 
      });
      io.to(partner.id).emit("match_found", { 
        partnerId: socket.id, 
        partnerName: "Hidden Heart", 
        partnerExternalId: userData.externalId 
      });
    } else {
      waitingUsers.push({ 
        id: socket.id, 
        externalId: userData.externalId, 
        name: userData.name, 
        gender: userData.gender 
      });
    }
  });

  socket.on("reveal_name", ({ to, myName }) => {
    io.to(to).emit("partner_name_revealed", { name: myName });
  });

  socket.on("send_message", ({ to, text }) => {
    io.to(to).emit("receive_message", { senderId: socket.id, text: text, timestamp: new Date().toISOString() });
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