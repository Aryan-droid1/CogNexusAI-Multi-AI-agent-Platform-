import redis from "../../../shared/redis/redis.js";
import { getModel } from "../config/llmModel.js";
import { countTokens } from "./tokenAwareHistory.js";

const getSummaryKey = (conversationId) =>
  `summary-${conversationId}`;

const getSummaryCursorKey = (conversationId) =>
  `summary-cursor-${conversationId}`;

const SUMMARY_TRIGGER_TOKENS = 2000;
const RECENT_HISTORY_TOKENS = 1000;

export const getConversationSummary = async (conversationId) => {
  const key = getSummaryKey(conversationId);

  const summary = await redis.get(key);

  return summary || "";
};

export const updateConversationSummary = async (
  conversationId,
  oldSummary,
  messages
) => {

  if (!messages.length) {
    return oldSummary || "";
  }

  const llm = await getModel("chat");

  const conversationText = messages
    .map(
      (msg) =>
        `${msg.role.toUpperCase()}: ${msg.content}`
    )
    .join("\n\n");

  const prompt = `
You are maintaining long-term memory for a conversation.

Existing summary:
${oldSummary || "No previous summary."}

New messages that need to be added to the summary:
${conversationText}

Update the existing summary using the new messages.

Rules:
- Keep important facts about the user's goals, preferences, projects, and decisions.
- Keep important technical topics discussed.
- Preserve information useful for future questions.
- Remove greetings, repetition, and unnecessary details.
- Do not invent information.
- Do not simply repeat the messages.
- Keep the final summary concise.
`;

  const response = await llm.invoke(prompt);

  const summary = response.content;

  await redis.set(
    getSummaryKey(conversationId),
    summary,
    "EX",
    24 * 60 * 60
  );

  return summary;
};

export const summarizeIfNeeded = async (
  conversationId,
  history
) => {

  const totalTokens = history.reduce(
    (total, message) =>
      total + countTokens(message.content),
    0
  );

  

  const summary =
    await getConversationSummary(conversationId);

  // No summarization required yet
  if (totalTokens <= SUMMARY_TRIGGER_TOKENS) {
    return {
      summary,
      recentHistory: history
    };
  }

  console.log(
    "History exceeded summary threshold."
  );

  const cursorKey =
    getSummaryCursorKey(conversationId);

  const rawCursor =
    await redis.get(cursorKey);

  const summaryCursor =
    rawCursor ? Number(rawCursor) : 0;

  console.log(
    "Summary cursor:",
    summaryCursor
  );

  // Find the recent history that should remain
  // directly available to the LLM.
  let recentTokens = 0;
  let splitIndex = history.length;

  for (
    let i = history.length - 1;
    i >= 0;
  ) {

    const current = history[i];

    if (
      current.role === "assistant" &&
      i > 0 &&
      history[i - 1].role === "user"
    ) {

      const userMessage = history[i - 1];
      const assistantMessage = current;

      const turnTokens =
        countTokens(userMessage.content) +
        countTokens(assistantMessage.content);

      if (
        recentTokens + turnTokens >
        RECENT_HISTORY_TOKENS
      ) {
        break;
      }

      recentTokens += turnTokens;

      splitIndex = i - 1;

      i -= 2;

    } else {

      i--;

    }
  }

  const candidateMessages =
    history.slice(0, splitIndex);

  // Only messages that have not already
  // been incorporated into the summary.
  const newMessages =
    candidateMessages.slice(summaryCursor);

  if (!newMessages.length) {

    console.log(
      "No new messages need summarization."
    );

    return {
      summary,
      recentHistory: history.slice(splitIndex)
    };
  }

  console.log(
    "New messages being summarized:",
    newMessages.length
  );

  const updatedSummary =
    await updateConversationSummary(
      conversationId,
      summary,
      newMessages
    );

  // Mark these messages as summarized.
  await redis.set(
    cursorKey,
    String(splitIndex),
    "EX",
    24 * 60 * 60
  );

  return {
    summary: updatedSummary,
    recentHistory: history.slice(splitIndex)
  };
};