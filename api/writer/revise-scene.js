import { reviseScene } from '../_lib/writer.js'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { brief, scene, prevScene, nextScene, continuity, instruction } = req.body
  await reviseScene(brief, { scene, prevScene, nextScene, continuity }, instruction, res)
}
