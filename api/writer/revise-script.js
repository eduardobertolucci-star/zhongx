import { reviseScript } from '../_lib/writer.js'

export const config = { maxDuration: 180 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { brief, scenes, instruction } = req.body
  await reviseScript(brief, scenes, instruction, res)
}
