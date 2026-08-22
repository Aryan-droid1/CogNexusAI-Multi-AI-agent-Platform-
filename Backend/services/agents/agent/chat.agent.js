import {
  AIMessage,
  HumanMessage,
  SystemMessage
} from "@langchain/core/messages";

import { getModel } from "../config/llmModel.js";
import { getMemory } from "../config/memory.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

import {
  summarizeIfNeeded
} from "../utils/conversationSummary.js";

export const chatAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "chat");

    const llm = await getModel("chat");

    const history = await getMemory(state.conversationId);
    const {
      summary,
      recentHistory
    } = await summarizeIfNeeded(
      state.conversationId,
      history
    );



    let searchContext = "";

    if (state.searchResults?.results?.length) {
      const results = state.searchResults.results
        .slice(0, 3)
        .map(
          (r, index) => `
${index + 1}. ${r.title}

${r.content}

Source: ${r.url}
`
        )
        .join("\n");

      searchContext = `
Web Search Results:

${results}

Use ONLY the search results above to answer the user.
`;
    }

    const prompt = `
You are CogNexusAI, an intelligent AI Assistant.

${searchContext}

If searchContext exists:
-use search result to answer.
-Do not mention internal tools.

Rules:
-For simple question, greeting, and short queries, respond naturally in plain text.
-For technical, education, coding, or detailed topics, use clean Markdown.
-Use # for titles and ## for sections.
-Leave a blank line after headings.
-Use bullet points for lists.
-Use numbered lists for steps.
-Use fenced code blocks with language tags for code.
-Keep paragraphs short and readable.
-Never generate large walls of text.

Links:
- Always format URLs as Markdown links.
- Never output raw URLs.
`;

    const messages = [
      new SystemMessage(prompt)
    ];

    // Phase 2: long-term conversation memory
    if (summary) {
      messages.push(
        new SystemMessage(`
Conversation memory:

${summary}
`)
      );
    }

    // Phase 1: token-aware recent history


    recentHistory.forEach(msg => {
      if (msg.role === "user") {
        messages.push(
          new HumanMessage(msg.content)
        );
      }

      if (msg.role === "assistant") {
        messages.push(
          new AIMessage(msg.content)
        );
      }
    });

    // Current question
    messages.push(
      new HumanMessage(state.prompt)
    );

    console.log("========== REQUEST ==========");

    messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}`);
      console.log("Type:", msg._getType());
      console.log("Content:", msg.content);
    });

    console.log("=============================");

    const response = await llm.invoke(messages);

    console.log("========== TOKEN USAGE ==========");
    console.log(response.usage_metadata);
    console.log("=================================");

    await deductCredits(state.userId, "chat");

    return {
      ...state,
      aiResponse: response.content
    };

  } catch (error) {
    console.error("CHAT AGENT ERROR:", error);

    return {
      ...state,
      aiResponse:
        error?.message || "failed to process Chat"
    };
  }
};