import redis from '../../../shared/redis/redis.js';
import { getMessages } from '../utils/getMessages.js';



const MAX_MEMORY_TOKENS = 2000;

export const getMemory = async (conversationId) => {
  const key = `messages-${conversationId}`;

  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  const messages = await getMessages(conversationId);

  await redis.set(
    key,
    JSON.stringify(messages),
    "EX",
    24 * 60 * 60
  );

  return messages;
};


export const addMessage = async (conversationId, role, content) => {

  const key = `messages-${conversationId}`;

  const rawMessages = await redis.get(key);

  const messages = rawMessages
    ? JSON.parse(rawMessages)
    : [];

  messages.push({
    role,
    content
  });

  await redis.set(
    key,
    JSON.stringify(messages)
  );
};
