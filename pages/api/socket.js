import { Server } from "socket.io";

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    const rooms = {}; // { roomId: { hostId, viewers: Set(), title, hostName } }

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      socket.on("join-room", ({ roomId, userName, isHost }) => {
        socket.join(roomId);
        socket.roomId = roomId;
        socket.userName = userName;
        socket.isHost = isHost;

        if (!rooms[roomId]) {
          rooms[roomId] = { hostId: null, viewers: new Set(), title: "", hostName: "" };
        }

        if (isHost) {
          rooms[roomId].hostId = socket.id;
          rooms[roomId].hostName = userName;
        } else {
          rooms[roomId].viewers.add(socket.id);
          
          // Notify host of new viewer
          if (rooms[roomId].hostId) {
            io.to(rooms[roomId].hostId).emit("viewer-joined", { 
              viewerId: socket.id, 
              viewerName: userName 
            });
          }
        }

        // Notify all users in room about the join
        socket.to(roomId).emit("user-joined", { 
          userId: socket.id, 
          userName,
          isHost 
        });

        // Send current viewer count to host
        if (rooms[roomId].hostId) {
          io.to(rooms[roomId].hostId).emit("viewer-count", rooms[roomId].viewers.size);
        }

        console.log(`${userName} joined room ${roomId}`);
      });

      // Host sends signal to viewers
      socket.on("host-signal", ({ roomId, data }) => {
        socket.to(roomId).emit("host-signal", { data });
      });

      // Viewer sends signal to host
      socket.on("viewer-signal", ({ roomId, data }) => {
        const room = rooms[roomId];
        if (room && room.hostId) {
          io.to(room.hostId).emit("viewer-signal", { data });
        }
      });

      // Chat messages
      socket.on("chat-message", ({ roomId, message }) => {
        io.to(roomId).emit("chat-message", {
          userName: socket.userName,
          message,
          timestamp: new Date().toISOString(),
        });
      });

      // Update room info
      socket.on("update-room-info", ({ roomId, title }) => {
        if (rooms[roomId] && socket.isHost) {
          rooms[roomId].title = title;
          io.to(roomId).emit("room-info-updated", { title });
        }
      });

      socket.on("disconnect", () => {
        if (socket.roomId) {
          const room = rooms[socket.roomId];
          if (room) {
            if (socket.isHost) {
              // Host left, close room
              delete rooms[socket.roomId];
              socket.to(socket.roomId).emit("room-closed");
            } else {
              // Viewer left
              room.viewers.delete(socket.id);
              if (room.hostId) {
                io.to(room.hostId).emit("viewer-count", room.viewers.size);
              }
            }
          }
          
          socket.to(socket.roomId).emit("user-left", { 
            userId: socket.id,
            userName: socket.userName 
          });
        }
        
        console.log("Client disconnected:", socket.id);
      });
    });

    // Store rooms globally for API access
    global.rooms = rooms;
  }
  res.end();
};

export default ioHandler;

