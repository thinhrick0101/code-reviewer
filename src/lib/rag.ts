import { MemoryVectorStore } from "memory-vector-store";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { Document } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { PromptTemplate } from "@langchain/core/prompts";

class RAGService {
  private static instance: RAGService;
  private vectorStore: MemoryVectorStore | null = null;
  private model: ChatOpenAI;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || 'YOUR_API_KEY';
    this.model = new ChatOpenAI({
      apiKey: this.apiKey,
      model: "gpt-4"
    });
  }

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  private async initializeVectorStore() {
    const docsPath = join(process.cwd(), "docs");
    const files = await readdir(docsPath);
    const texts = await Promise.all(
      files.map(async (file) => {
        const filePath = join(docsPath, file);
        const content = await readFile(filePath, "utf-8");
        return new Document({ pageContent: content });
      })
    );

    this.vectorStore = new MemoryVectorStore(new OpenAIEmbeddings({
        apiKey: this.apiKey
    }));
    await this.vectorStore.addDocuments(texts);
  }

  public async getExplanation(question: string): Promise<string> {
    if (this.apiKey === 'YOUR_API_KEY') {
      console.warn('OpenAI API key not found. Using mock data for RAG.');
      return "This is a mock explanation. Please provide an OpenAI API key for real explanations.";
    }

    if (!this.vectorStore) {
      await this.initializeVectorStore();
    }

    if (!this.vectorStore) {
        throw new Error("Vector store not initialized");
    }

    const retriever = this.vectorStore.asRetriever();

    const promptTemplate = `Answer the user's question based on the following context:
{context}

Question: {question}`;

    const prompt = PromptTemplate.fromTemplate(promptTemplate);

    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      this.model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke(question);
    return result;
  }
}

export const ragService = RAGService.getInstance(); 