import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
const client = new OpenAI();

// Prompt 01 - Single Prompt

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Escribe un poema sobre la vida.",
});

console.log(response.output_text);
