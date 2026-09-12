import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { gerarConceptPitch, gerarScript } from './agents/writer.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ZhongX Studio online' })
})

app.post('/api/writer/concept-pitch', (req, res) => {
  gerarConceptPitch(req.body, res)
})

app.post('/api/writer/script', (req, res) => {
  const { brief, gateDecision } = req.body
  gerarScript(brief, gateDecision, res)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`ZhongX Server running on port ${PORT}`)
})
