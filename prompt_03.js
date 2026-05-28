import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

import OpenAI from "openai";
const client = new OpenAI();

// Prompt 03 - Secuencial Prompts

const text = `
  este.. eh.. el presidente se reunió ayer 
  con representantes de, eh, de tres empresas tecnológicas 
  en ciudad de méxico para hablar sobre inversiones este año 2026
  y 2027, sin embargo, no se mencionó el monto de las inversiones en ningún momento.
`;

// ------------------------------------------------------------
// Step 1: Clean text
// ------------------------------------------------------------
const step1 = await client.responses.create({
  model: "gpt-5.4-mini",
  input: `Limpia este texto de transcripción, corrige errores obvios y elimina muletillas. Devuelve solo el texto limpio.
          \n\nTEXTO: ${text}`,
});

const cleanText = step1.output_text;
console.log("✅ Step 1: clean text");

// ------------------------------------------------------------
// Step 2: Extract data
// ------------------------------------------------------------

const DataSchema = z.object({
  personas: z.array(z.string()),
  empresas: z.array(z.string()),
  lugares: z.array(z.string()),
  fechas: z.array(z.string()),
  montos: z.array(z.string()),
});

const step2 = await client.responses.parse({
  model: "gpt-5.4-mini",
  input: `Extrae los datos clave de la noticia.
          \n\nTEXTO: ${cleanText}`,
  text: { format: zodTextFormat(DataSchema, "DataSchema") },
});

const data = JSON.parse(step2.output[0].content[0].text);
console.log("✅ Step 2: Datos clave extraídos");

// ------------------------------------------------------------
// Step 3: Generate title and summary
// ------------------------------------------------------------

const TitleAndSummarySchema = z.object({
  title: z.string(),
  summary: z.string(),
});

const step3 = await client.responses.create({
  model: "gpt-5.4-mini",
  input: `Genera un titulo y resumen periodístico de la noticia.
          \n\nTEXTO: ${cleanText}`,
  text: {
    format: zodTextFormat(TitleAndSummarySchema, "TitleAndSummarySchema"),
  },
});

const summary = JSON.parse(step3.output[0].content[0].text);
console.log("✅ Step 3: título y resumen generados");

console.log({ cleanText, data, summary });
