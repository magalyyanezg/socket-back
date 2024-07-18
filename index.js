const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { serialize } = require("cookie");
const multer = require("multer");
const path = require("path");
const cors = require('cors'); // Importa el middleware cors

const app = express();
app.use(cors({ origin: 'http://localhost:3000' })); // Configura CORS

const server = createServer(app);
const io = new Server(server, {
  cookie: {
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: true
  },
  cors: {
    origin: "http://localhost:3000"
  }
});

// Configuración de multer para manejar el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: path.resolve(__dirname, "uploads/"),
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de imagen."));
    }
  }
});

app.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    const imageUrl = `http://localhost:9001/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } else {
    res.status(400).send("Error al subir la imagen");
  }
});


io.engine.on("initial_headers", (headers, request) => {
  headers["set-cookie"] = serialize("nombre", JSON.stringify({
    userId: "fbu831gr48bvuqeibu",
    names: "Pablito"
  }));
});

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  // Escuchar mensajes de texto
  socket.on("message", (data) => {
    console.log("Mensaje recibido:", data);
    io.emit("newMessage", data); // Emitir mensaje a todos los clientes
  });

  // Escuchar imágenes y reenviarlas a todos los clientes
  socket.on("image", (data) => {
    console.log("Imagen recibida y reenviada:", data);
    io.emit("newImage", data); // Emitir imagen a todos los clientes
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


server.listen(9001, () => {
  console.log("Servidor HTTP en el puerto 9001");
});

io.listen(9002);
