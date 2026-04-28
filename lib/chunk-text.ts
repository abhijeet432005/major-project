import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function splitTextIntoChunks(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });

  return splitter.splitText(text);
}