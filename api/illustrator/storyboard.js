import { generateStoryboard } from '../_lib/illustrator.js'

export const config = { maxDuration: 300 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { brief, scenes } = req.body
  if (!brief || !scenes) return res.status(400).json({ error: 'brief and scenes are required' })
  await generateStoryboard(brief, scenes, res)
}
