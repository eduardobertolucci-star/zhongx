import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { gerarRoteiro } from './agents/roteirista.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ZhongX Studio online' })
})

app.post('/api/roteirista', (req, res) => {
  gerarRoteiro(req.body, res)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`ZhongX Server running on port ${PORT}`)
})
