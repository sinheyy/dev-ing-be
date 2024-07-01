const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const indexRouter = require("./routes/index");
const chatController = require("./controllers/chat.controller");
require("dotenv").config();


const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // 모든 출처에서의 요청을 허용. 필요에 따라 특정 출처로 제한할 수 있습니다.
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoURI = process.env.MONGODB_URI_PROD;
const PORT = process.env.PORT || 5000;

mongoose
    .connect(mongoURI)
    .then(() => console.log("mongoose connected"))
    .catch((error) => console.log("DB connection failed", error));

app.use("/api", indexRouter);

// app.listen(PORT, () => {
//     console.log(`Server is running on ${PORT}`);
// });

io.on("connection", async (socket) => {
     // 소켓 커넥션이 성공적으로 이루어졌을 때 실행되는 이벤트 처리

    // console.log("connected : ", socket.id);

    socket.on("join room", (roomId) => {
        socket.join(roomId);
        // console.log(`User joined room: ${roomId}`);
    });

    socket.on("disconnect", () => {
        // console.log("disconnected : ", socket.id);
    });

    socket.on(
        "chat message",
        async ({ userName, userProfileImage, roomId, message }) => {
            console.log(userName, userProfileImage, roomId, message);

            const savedMessage = await chatController.saveChatMessage({
                userName,
                userProfileImage,
                roomId,
                message,
            });

            io.to(roomId).emit("chat message", savedMessage);
        }
    );
});

server.listen(PORT, (error) => {
    if (error) {
        console.error("Failed to start server:", error);
    } else {
        console.log("Server listening on port", PORT);
    }
});