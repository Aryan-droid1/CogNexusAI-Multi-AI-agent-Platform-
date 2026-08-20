import { getModel } from '../config/llmModel.js'
import axios from 'axios'
import { getFromS3 } from '../utils/getFromS3.js'
import { uploadToS3 } from "../utils/uploadToS3.js"
import { deductCredits } from '../utils/deductCredits.js'
import { checkAgentLimit } from '../config/agentLimit.js'

export const visionAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "vision")
    const llm = await getModel("image")
    const res = await llm.invoke(`
    You are an elite AI image prompt engineer.


  Convert the user request into a highly detailed image generation prompt.

  Requirements:
  -Cinematic lighting
  -Professional composition
  -Ultra realistic
  -Beautiful color palette
  -Sharp focus
  -8k quality
  -Photorealistic
  -Depth of field
  -professional Photography
  -Stunning visuals


  Return only the image prompt.

  User Request:
    ${state.prompt}
    `)

    const prompt = res.content.trim()
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`

    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" })
    await deductCredits(state.userId, "vision");

    const buffer = Buffer.from(imageRes.data)
    const filename = `image-${Date.now()}.jpg`

    await uploadToS3(filename, buffer, "image/jpeg")
    const downloadUrl = await getFromS3(filename, 10 * 60)

    return {
      ...state,
      aiResponse: `
   

  ![Generated Image](${downloadUrl})

  📩[Download Image](${downloadUrl})

  ⏱️Link expires in 10 minutes.`
    }

  } catch (error) {
    console.error("VISION ERROR:", error);

     return {
      ...state,
      aiResponse: error?.data?.message || "failed to generate Image."
    }
  }





}