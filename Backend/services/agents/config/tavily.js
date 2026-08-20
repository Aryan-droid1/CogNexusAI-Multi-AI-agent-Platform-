import {TavilySearch} from "@langchain/tavily"

export const searchTool = new TavilySearch({
  maxResults:5,
  topic:"general",
  includeImageDescriptions:true
});