import http from 'http'
import express from 'express'
import config from "./config/index.js"
import databaseConnect from "./database/connection.js"
import pasteRoutes from "./routes/paste.routes.js"
import cors from "cors";


const app = express();

app.use(express.json());

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}

app.use(cors(corsOptions))

app.use("/api", pasteRoutes);


app.get("/p/:id", async (req, res) => {
  try {
    const { getPasteHTML } = await import(
      "./src/controllers/paste.controller.js"
    );
    await getPasteHTML(req, res);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
});
const server = http.createServer(app)

databaseConnect((isConnect) =>{
    if (isConnect) {
        server.listen(config.PORT , () =>{
            console.log(`\x1b[33mServer runs in port ${config.PORT}...`)
        })
    }
})