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
  const { mode, ...brief } = req.body
  gerarConceptPitch(brief, mode || 'production', res)
})

app.post('/api/writer/script', (req, res) => {
  const { brief, gateDecision, approvedAngleSnapshot, mode } = req.body
  gerarScript(brief, gateDecision, approvedAngleSnapshot || '', mode || 'production', res)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`ZhongX Server running on port ${PORT}`)
})
