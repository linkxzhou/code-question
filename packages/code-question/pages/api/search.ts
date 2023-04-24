import type { NextApiRequest, NextApiResponse } from "next";

import path from "path";

import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { OpenAIChat } from "langchain/llms";
import { PromptTemplate } from "langchain/prompts";

import { getRepositoryManager } from "services/RepositoryManager";

const NUM_RESULTS = 3;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { query, project } = req.body;
  const repository = getRepositoryManager((res.socket! as any).server);
  switch (req.method) {
    case "POST": {
      const log = console.log;
      console.log = () => {};
      const vectorStore = await HNSWLib.load(
        path.join(repository.getProject(project).projectDir, "index"),
        new OpenAIEmbeddings()
      );

      const llm = new OpenAIChat({ temperature: 0.2, cache: true });
      const queryResult = await vectorStore.similaritySearchWithScore(
        query,
        NUM_RESULTS
      );

      const formattedResults = queryResult.map(async (result: any[]) => {
        const code = result[0].pageContent;
        const language = result[0].metadata.language;
        const prompt = await CodeTemplate.format({ language, query, code });
        return {
          pageContent: code,
          metadata: {
            language: language,
            source: result[0].metadata.source,
            score: 1.0 - result[1],
            summary: await llm.call(prompt),
            lineNumber: result[0].metadata.range.start.row + 1,
          },
        };
      });

      const results = (await Promise.all(formattedResults)).filter(
        ({ metadata }) => !metadata.summary.includes("NOT HELPFUL")
      );
      return res.status(200).json(results);
    }
    default: {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
}

const CodeTemplate = new PromptTemplate({
  template: `Given the following {language} code and a question, create a concise answer in markdown.
If the snippet is not really helpful, just say "NOT HELPFUL".
=========
{code}
=========

QUESTION: {query}
FINAL ANSWER:`,
  inputVariables: ["language", "query", "code"],
});
