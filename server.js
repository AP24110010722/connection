require("dotenv").config({ path: ".env.local" });
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");

// 1. UPDATED: Add a simple request listener for Render's health check
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("HeartBridge Socket Server is Running!");
});

// 2. UPDATED: CORS is already good ("*"), keep it.
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// --- MONGO SETUP ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/heartbridge';
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ DB Error:", err));

const UserSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true },
  name: String,
  friends: [String],
});
const MessageSchema = new mongoose.Schema({
  participants: [String],
  senderId: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

// --- GLOBAL STATE ---
let onlineUsers = [];
let waitingUsers = []; 

io.on("connection", (socket) => {
  console.log(`🔌 New Connection: ${socket.id}`);

  // 1. User Joins
  socket.on("user_joined", async (userData) => {
    if (!userData || !userData.externalId) return;
    console.log(`👤 User Joined: ${userData.name} (${userData.gender})`);

    try {
      await User.findOneAndUpdate(
        { externalId: userData.externalId },
        { $set: { name: userData.name }, $setOnInsert: { friends: [] } },
        { upsert: true, returnDocument: 'after' }
      );

      onlineUsers = onlineUsers.filter(u => u.externalId !== userData.externalId);
      onlineUsers.push({ ...userData, id: socket.id });
      io.emit("online_users_update", onlineUsers);
    } catch (e) { console.error(e); }
  });

  // 2. Random Match Logic
  socket.on("find_connection", (userData) => {
    console.log(`🔍 SEARCHING: ${userData.name} (${userData.gender})`);
    if (!userData.gender) return;

    waitingUsers = waitingUsers.filter(u => u.externalId !== userData.externalId);
    waitingUsers = waitingUsers.filter(u => io.sockets.sockets.get(u.id));

    const partnerIndex = waitingUsers.findIndex(
      (u) => u.gender.toLowerCase() !== userData.gender.toLowerCase()
    );

    if (partnerIndex !== -1) {
      const partner = waitingUsers.splice(partnerIndex, 1)[0];
      io.to(socket.id).emit("match_found", { partnerId: partner.id, partnerName: partner.name, partnerExternalId: partner.externalId });
      io.to(partner.id).emit("match_found", { partnerId: socket.id, partnerName: userData.name, partnerExternalId: userData.externalId });
    } else {
      waitingUsers.push({ id: socket.id, ...userData });
    }
  });

  // 3. Add Friend (ONE WAY)
  socket.on("add_friend", async ({ targetId, myId }) => {
    const me = await User.findOne({ externalId: myId });
    const them = await User.findOne({ externalId: targetId });
    if (!me || !them) return;

    if (!me.friends.includes(targetId)) {
      me.friends.push(targetId);
      await me.save();
    }
    
    // Check Mutual
    if (them.friends.includes(myId)) {
      const mySock = onlineUsers.find(u => u.externalId === myId);
      const theirSock = onlineUsers.find(u => u.externalId === targetId);
      if (mySock) io.to(mySock.id).emit("friendship_status", { with: targetId, status: "mutual" });
      if (theirSock) io.to(theirSock.id).emit("friendship_status", { with: myId, status: "mutual" });
    }
  });

  // 4. Remove Friend (NEW - MUTUAL)
  socket.on("remove_friend", async ({ targetId, myId }) => {
    console.log(`💔 Unfriending: ${myId} removes ${targetId}`);
    try {
        // Remove from both
        await User.findOneAndUpdate({ externalId: myId }, { $pull: { friends: targetId } });
        await User.findOneAndUpdate({ externalId: targetId }, { $pull: { friends: myId } });

        // Notify both users (Optional: Client can listen to this to auto-refresh)
        const mySock = onlineUsers.find(u => u.externalId === myId);
        const theirSock = onlineUsers.find(u => u.externalId === targetId);
        if (mySock) io.to(mySock.id).emit("friend_removed", targetId);
        if (theirSock) io.to(theirSock.id).emit("friend_removed", myId);
    } catch(e) { console.error(e); }
  });

  // 5. Chat & Schedule
  socket.on("send_message", async ({ to, text, senderId, recipientId }) => {
    if (senderId && recipientId) {
       await Message.create({ participants: [senderId, recipientId].sort(), senderId, text });
    }
    io.to(to).emit("receive_message", { senderId: socket.id, text, timestamp: new Date() });
  });

  socket.on("schedule_message", async ({ to, text, sendAt, senderId, recipientId }) => {
    const delay = new Date(sendAt).getTime() - Date.now();
    if (delay < 0) return;
    setTimeout(async () => {
        await Message.create({ participants: [senderId, recipientId].sort(), senderId, text });
        io.to(to).emit("receive_message", { senderId: "System-Schedule", text: `📅 Future: ${text}`, timestamp: new Date() });
    }, delay);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
    onlineUsers = onlineUsers.filter(u => u.id !== socket.id);
    io.emit("online_users_update", onlineUsers);
  });
});

// 3. UPDATED: Use process.env.PORT for Render, fallback to 3001 for local
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));