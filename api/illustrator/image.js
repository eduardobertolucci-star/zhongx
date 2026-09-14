import { generateStoryboardImage } from '../_lib/illustrator.js'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { brief, storyboard } = req.body
  if (!brief || !storyboard) return res.status(400).json({ error: 'brief and storyboard are required' })

  try {
    const imageUrl = await generateStoryboardImage(storyboard, brief)
    res.status(200).json({ imageUrl })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
