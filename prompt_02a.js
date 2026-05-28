import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
const client = new OpenAI();

// Prompt 02 - Prompt + JSON Mode
// https://developers.openai.com/api/docs/guides/structured-outputs

const response = await client.responses.parse({
  model: "gpt-5.4-mini",
  input: "Devuelve las estadísticas de un pokemon aleatorio en formato JSON.",
  text: { format: { type: "json_object" } },
});

console.log({ ...JSON.parse(response.output[0].content[0].text) });
