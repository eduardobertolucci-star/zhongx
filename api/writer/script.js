import { gerarScript } from '../_lib/writer.js'

export const config = { maxDuration: 300 }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { brief, gateDecision, approvedAngleSnapshot, mode } = req.body
  await gerarScript(brief, gateDecision, approvedAngleSnapshot || '', mode || 'production', res)
}
