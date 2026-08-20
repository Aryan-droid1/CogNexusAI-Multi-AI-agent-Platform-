import { getModel } from "../config/llmModel.js";

export const router = async (state) => {

  // Uploaded PDF → PDF RAG
  if (state.file?.mimetype === "application/pdf") {
    console.log("PDF detected → pdfRag");

    return {
      ...state,
      agent: "pdfRag"
    };
  }

  // Uploaded image → Image Analyzer
  if (state.file?.mimetype?.startsWith("image/")) {
    console.log("Image detected → imageAnalyzer");

    return {
      ...state,
      agent: "imageAnalyzer"
    };
  }

  // No file → respect manually selected agent
  if (state.agent && state.agent !== "auto") {
    return {
      ...state,
      agent: state.agent
    };
  }

  const llm = await getModel("router");

  const prompt = `
You are an agent router.

Available agents:
- chat
- search
- coding
- pdf
- ppt
- vision

Rules:

chat:
General conversation,
explanation,
learning,
questions.

search:
Current events,
latest information,
news,
recent developments,
internet lookup.

coding:
Generate code,
debug code,
build projects,
architecture,
API design.

pdf:
Questions about generating PDFs or document context.

vision:
Generate Image,
create Image.

ppt:
Questions about generating PPTs or PPT context.

Return only one word:
chat
search
coding
pdf
ppt
vision

User Query:
${state.prompt}
`;

  const response = await llm.invoke(prompt);

  return {
    ...state,
    agent: response.content.trim().toLowerCase()
  };
};