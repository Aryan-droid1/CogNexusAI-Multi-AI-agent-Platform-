import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModel.js";
import { deductCredits } from "../utils/deductCredits.js";

async function generateFile(llm, fileName, prompt, previousFiles = {}) {
  const context = Object.entries(previousFiles)
    .map(([name, content]) => {
      return `----- ${name} -----\n${content}`;
    })
    .join("\n\n");

  const res = await llm.invoke(`
You are CogNexusAI Coding Agent.

Project Request:

${prompt}

Previously Generated Files:

${context || "None"}

Generate ONLY the file:

${fileName}

Rules:

- Return ONLY file contents.
- No markdown.
- No explanation.
- No \`\`\`
- Do not generate any other file.

If generating CSS or JS, make sure it matches the HTML already generated.
`);

  return res.content;
}
export const codingAgent = async (state) => {
try{
  

  await checkAgentLimit(state.userId, "coding")
  const intentModel = await getModel("intent");
  const codingModel = await getModel("coding");

  const intentRes = await intentModel.invoke(`
You are an intent classifier.

Return ONLY one of:

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:

${state.prompt}
`);

  const intent = intentRes.content.trim();

  if (intent !== "CODE_GENERATION") {

    const res = await codingModel.invoke(`
The user's request is:

${intent}

Return markdown only.

Never generate project files.

Use headings:

# Overview

## Explanation

## Problem

## Improvement

## Best Practices

## Optimized Code

User Request:

${state.prompt}
`);

    return {
      ...state,
      aiResponse: res.content,
      artifacts: []
    };
  }

  //---------------------------------------------
  // STEP 1
  // Planner
  //---------------------------------------------

  const planner = await codingModel.invoke(`
You are a project planner.

User Request:

${state.prompt}

Return ONLY JSON.

Schema:

{
  "files":[
    "index.html",
    "style.css",
    "script.js",
    "README.md"
  ]
}

Rules:

- Default stack is HTML/CSS/JS.
- Include README.md.
- Return JSON only.
`);

  let filesToGenerate = [];

  try {
    filesToGenerate = JSON.parse(planner.content).files;
  } catch {
    filesToGenerate = [
      "index.html",
      "style.css",
      "script.js",
      "README.md"
    ];
  }

  //---------------------------------------------
  // STEP 2
  // Generate Files
  //---------------------------------------------

  const generatedFiles = {};

  for (const file of filesToGenerate) {

    generatedFiles[file] = await generateFile(
      codingModel,
      file,
      state.prompt,
      generatedFiles
    );

  }

  //---------------------------------------------
  // STEP 3
  // Build Artifact
  //---------------------------------------------

  const artifactFiles = Object.entries(generatedFiles).map(
    ([name, content]) => ({
      name,
      content
    })
  );
  

  await deductCredits(state.userId, "coding");

  

  return {

    ...state,

    aiResponse: "Code Generated Successfully.",

    artifacts: [

      {
        id: Date.now(),
        type: "project",
        title: state.prompt,
        files: artifactFiles
      }

    ]

  };



} catch(error){
   return {
      ...state,
      aiResponse: error?.data?.message || "failed to generate Code."
    }

}
}
