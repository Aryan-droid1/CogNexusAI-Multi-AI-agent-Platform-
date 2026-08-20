import { StateGraph } from "@langchain/langgraph";
import { agentstate } from "./state.js";
import { router } from "./router.js";
import { searchAgent } from "../agent/search.agent.js";
import { codingAgent } from "../agent/coding.agent.js";
import { pptAgent } from "../agent/ppt.agent.js";
import { chatAgent } from "../agent/chat.agent.js";
import {  visionAgent } from "../agent/vision.agent.js";
import { pdfAgent } from "../agent/pdf.agent.js";
import { pdfRag } from "../agent/pdfRag.agent.js";
import { imageAnalyzer } from "../agent/imageAnalyzer.js";

const workflow = new StateGraph(agentstate)

workflow.addNode("router",router)
workflow.addNode("search",searchAgent)
workflow.addNode("coding",codingAgent)
workflow.addNode("ppt",pptAgent)
workflow.addNode("chat",chatAgent)
workflow.addNode("vision",visionAgent)
workflow.addNode("pdf",pdfAgent)
workflow.addNode("pdfRag",pdfRag)
workflow.addNode("imageAnalyzer",imageAnalyzer)


workflow.addEdge("__start__","router") // not a conditional edge
workflow.addConditionalEdges("router",(state)=>{
  switch(state.agent) {
    case "chat":
      return "chat";
    case "search":
      return "search";
    case "coding":
      return "coding";
    case "pdf":
      return "pdf" ;
    case "vision":
      return "vision";
    case "ppt":
      return "ppt";

    case "pdfRag":
      return "pdfRag";

    case "imageAnalyzer":
       return "imageAnalyzer";

    default:
     return "chat"

  }
},  {
    chat: "chat",
    search: "search",
    coding: "coding",
    pdf: "pdf",
    vision: "vision",
    ppt: "ppt",
    pdfRag: "pdfRag",
    imageAnalyzer: "imageAnalyzer"
})


workflow.addEdge("search","chat")
workflow.addEdge("chat","__end__")
workflow.addEdge("coding","__end__")
workflow.addEdge("pdf","__end__")
workflow.addEdge("vision","__end__")
workflow.addEdge("ppt","__end__")
workflow.addEdge("pdfRag", "__end__")
workflow.addEdge("imageAnalyzer", "__end__")


// to compile above 

export const graph=workflow.compile()