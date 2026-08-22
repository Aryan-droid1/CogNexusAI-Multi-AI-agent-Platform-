import { encodingForModel } from "js-tiktoken";

const encoding = encodingForModel("gpt-4o");

 export const countTokens = (text) => {
  return encoding.encode(text).length;
};

export const getTokenAwareHistory = (history, maxTokens = 1000) => {
  const selected = [];
  let totalTokens = 0;

  // Start from the newest message
  let i = history.length - 1;

  while (i >= 0) {
    const current = history[i];

    // We expect a user message followed by an AI message.
    // Since we're moving backwards, handle AI first.
    if (current.role === "assistant") {
      const aiMessage = current;
      const userMessage = history[i - 1];

      // If there is no corresponding user message,
      // skip this AI message.
      if (!userMessage || userMessage.role !== "user") {
        i--;
        continue;
      }

      const userTokens = countTokens(userMessage.content);
      const aiTokens = countTokens(aiMessage.content);

      const turnTokens = userTokens + aiTokens;

      // If the complete turn doesn't fit, stop.
      if (totalTokens + turnTokens > maxTokens) {
        break;
      }

      selected.unshift(userMessage);
      selected.unshift(aiMessage);

      totalTokens += turnTokens;

      i -= 2;
    } 
    
    // If we encounter a user message without an AI response
    else if (current.role === "user") {
      const userTokens = countTokens(current.content);

      if (totalTokens + userTokens > maxTokens) {
        break;
      }

      selected.unshift(current);
      totalTokens += userTokens;

      i--;
    } 
    
    else {
      i--;
    }
  }

 
  return selected;
};