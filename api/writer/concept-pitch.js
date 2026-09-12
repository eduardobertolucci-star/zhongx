import { gerarConceptPitch } from '../_lib/writer.js'

export const config = { maxDuration: 300 }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { mode, ...brief } = req.body
  await gerarConceptPitch(brief, mode || 'production', res)
}
