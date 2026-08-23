import express from 'express'
import { createServer } from 'http'
import { registerContextRoutes } from '../contexts/routes'
import { rateLimit } from 'express-rate-limit'

const app = express()

// in-memory rate limit
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many requests from this IP, please try again later'
});

app.use(limiter)
app.use(express.json())
registerContextRoutes(app)

export const server = createServer(app)
