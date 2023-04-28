import type { NextApiRequest, NextApiResponse } from "next";

import path from "path";

import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { OpenAIChat } from "langchain/llms";
import { PromptTemplate } from "langchain/prompts";

import { getRepositoryManager } from "services/RepositoryManager";

const NUM_RESULTS = 6;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { query, project } = req.body;
  const repository = getRepositoryManager((res.socket! as any).server);
  switch (req.method) {
    case "POST": {
      const vectorStore = await HNSWLib.load(
        path.join(repository.getProject(project).projectDir, "index"),
        new OpenAIEmbeddings()
      );

      let resultTryTimes = NUM_RESULTS;
      let queryResult: any = [];
      while (resultTryTimes > 0) {
        console.log("query: ", query, ", NUM_RESULTS: ", resultTryTimes);
        try {
          queryResult = await vectorStore.similaritySearchWithScore(
            query,
            NUM_RESULTS
          );
          break;
        } catch (err) {
          console.log("err: ", err);
          resultTryTimes = Math.floor(resultTryTimes / 2);
        }
      }

      console.log("queryResult: ", queryResult);
      let llm = new OpenAIChat({ temperature: 0.5, cache: true }); // {verbose: true} { basePath: "https://openai.vasdgame.com/v1" }
      const formattedResults = queryResult.map(async (result: any[]) => {
        const code = result[0].pageContent;
        const language = result[0].metadata.language;
        const prompt = await CodeTemplate.format({ language, query, code });
        let summary = "NOT HELPFUL"
        try {
          summary = await llm.call(prompt);
        } catch (e) {
          console.log("llm.call: ", e);
        }
        if (summary.includes("NOT HELPFUL")) {
          summary = "【🤔抱歉】AI可能找到正确答案，因此系统给出默认答案。";
        }
        return {
          pageContent: code,
          metadata: {
            language: language,
            source: result[0].metadata.source,
            score: 1.0 - result[1],
            summary: summary,
            lineNumber: result[0].metadata.range.start.row + 1,
          },
        };
      });

      const results = (await Promise.all(formattedResults)).filter(
        ({ metadata }) => !metadata.summary.includes("NOT HELPFUL")
      );
      console.log("results: ", results);
      return res.status(200).json(results);
    }
    default: {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
}

const CodeTemplate = new PromptTemplate({
  template: `如果给出以下{language}代码和一个问题，请用Markdown回答我。
如果能给出例子，请按照代码写一个样例；
如果代码中有用户名或者密码等敏感信息，请用***替换；
如果代码片段不是很有用，请回答"NOT HELPFUL"；
=========
{code}
=========

问题: {query}
最终答案:`,
  inputVariables: ["language", "query", "code"],
});
