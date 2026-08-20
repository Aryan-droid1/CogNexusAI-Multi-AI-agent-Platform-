import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModel.js"
import { getMemory } from "../config/memory.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const chatAgent = async (state) => {



  try {


    await checkAgentLimit(state.userId, "chat")

    const llm = await getModel("chat")

    const history = (await getMemory(state.conversationId))

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
   -For simple question, greeting, and short queries , respond naturally in plain text.

   -For technical, education, coding, or detailed topics, use clean Markdown.
  #formatting:
  -use # for titles and ## for setConversations.
  -Leave a blank line after headings.
  -Use bullet points for list.
  -Use numbered lists for steps.
  -Use fenced code blocks with language tags for code.
  -keep paragraphs short and Readable.
  -Never write headings and content on the same line.
  -Never generate large walls of text . 
  Links:
- Always format URLs as Markdown links.
- Never output raw URLs.
- Use the format:

[Link Name](https://example.com)

instead of

https://example.com
  `
    const messages = [
      new SystemMessage(prompt)

    ]

    const recentHistory = history.slice(-10);

    recentHistory.forEach(msg => {

      if (msg.role == "user") {
        messages.push(new HumanMessage(msg.content))
      }
      if (msg.role == "assistant") {
        messages.push(new AIMessage(msg.content))
      }
    });
    messages.push(new HumanMessage(state.prompt))
    console.log(messages)



    const response = await llm.invoke(messages);
    await deductCredits(state.userId, "chat")
    return {
      ...state,
      aiResponse: response.content
    }


  } catch (error) {
    return {
      ...state,
      aiResponse: error?.data?.message || "failed to process Chat"
    }
  }




}