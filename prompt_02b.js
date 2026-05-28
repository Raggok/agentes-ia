import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

import OpenAI from "openai";
const client = new OpenAI();

// Prompt 02 - Prompt + Structured Outputs
// https://developers.openai.com/api/docs/guides/structured-outputs

const PokemonExtraction = z.object({
  name: z.string(),
  stats: z.object({
    hp: z.number(),
    attack: z.number(),
    defense: z.number(),
    speed: z.number(),
  }),
});

const response = await client.responses.parse({
  model: "gpt-5.4-mini",
  input: "Devuelve las estadísticas de un pokemon aleatorio en formato JSON.",
  text: { format: zodTextFormat(PokemonExtraction, "PokemonExtraction") },
});

console.log({ ...JSON.parse(response.output[0].content[0].text) });
