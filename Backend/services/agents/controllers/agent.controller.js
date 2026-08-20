import { graph } from "../graph/graph.js";
import axios from "axios";

export const agent = async (req, res,next) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const file=req.file
    
    const userId = req.headers["x-user-id"]

    // First generate the response
    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
      userId,
      file
    });
    

    const response = result.aiResponse;

    





    // Then save both messages
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });
    console.log(result);
console.log(response);

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: response,
      images: result.images,
       artifacts: result?.artifacts,
    });

    return res.status(200).json({
      answer: response,
      images: result.images,
      artifacts:result?.artifacts
    });
  } catch (error) {
    next(error)
  }
};