import http from 'http'
import express from 'express'
import config from "./config/index.js"
import databaseConnect from "./database/connection.js"
import pasteRoutes from "./routes/paste.routes.js"
import cors from "cors"

const app = express()

app.use(express.json())

// Log the environment variable
console.log('process.env.FRONTEND_URL: ', process.env.FRONTEND_URL)
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV)

// ✅ DYNAMIC CORS - Reads from environment variable instead of hardcoded
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}

console.log('🌐 CORS Origin:', corsOptions.origin)

app.use(cors(corsOptions))

app.use("/api", pasteRoutes)

app.get("/p/:id", async (req, res) => {
  try {
    const { getPasteHTML } = await import(
      "./src/controllers/paste.controller.js"
    )
    await getPasteHTML(req, res)
  } catch (error) {
    console.error("Error:", error)
    res.status(500).send("Server Error")
  }
})

const server = http.createServer(app)

databaseConnect((isConnect) => {
  if (isConnect) {
    server.listen(config.PORT, () => {
      console.log(`✅ Server running on port ${config.PORT}`)
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  }
})

export default app