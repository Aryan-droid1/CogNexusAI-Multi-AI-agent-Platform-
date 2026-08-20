import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { addMessage } from "../../agents/config/memory.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const conversation = await Conversation.create({
      userId,
    });

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({
      message: `create conversation error ${error}`,
    });
  }
};

export const getConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const conversations = await Conversation.find({
      userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({
      message: `get conversation error ${error}`,
    });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body;

    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { title },
      {
  returnDocument: "after"
}
    );

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({
      message: `update conversation error ${error}`,
    });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, images,artifacts } = req.body;

    const message = await Message.create({
      conversationId,
      role,
      content,
      images,
      artifacts
    });

    await addMessage(conversationId, role, content);

    return res.status(200).json(message);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
      response: error.response?.data,
    });
  }
};

export const getMessage = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("GET MESSAGE ERROR:", error);

    return res.status(500).json({
      message: error.message,
      error,
    });
  }
};