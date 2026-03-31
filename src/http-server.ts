import express from 'express'
import { createServer } from 'http'

const app = express()

app.use(express.json())

export const server = createServer(app)
