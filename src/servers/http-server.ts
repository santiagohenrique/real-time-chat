import express from 'express'
import { createServer } from 'http'
import { registerContextRoutes } from '../contexts/routes'

const app = express()

app.use(express.json())
registerContextRoutes(app)

export const server = createServer(app)
