import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import OpenAI from "openai";
import * as cheerio from "cheerio";

const openai = new OpenAI();

const tools = [
  {
    type: "function",
    name: "get_clip_data",
    description: "Obtiene el resumen y el título de un clip",
    parameters: {
      type: "object",
      properties: {
        digest: {
          type: "string",
          description:
            "El identificador del clip, cadena alfanumérica de 36 caracteres como por ejemplo: 6b219fe6bebd70aacd7f101afb4235f4",
        },
      },
      required: ["digest"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "create_md_file",
    description: "Crea un archivo MD con el contenido proporcionado",
    parameters: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "El nombre del archivo MD",
        },
        content: {
          type: "string",
          description: "El contenido del archivo MD",
        },
      },
      required: ["filename", "content"],
      additionalProperties: false,
    },
    strict: true,
  },
];

async function get_clip_data(digest) {
  const response = await fetch(`https://www.efinf.com/clipviewer/${digest}`);
  const html = await response.text();

  const $ = cheerio.load(html);
  const title = $("title").text();
  const resumen = $('h4.font-transcription:contains("Resumen")')
    .next("div")
    .text()
    .trim();
  const transcript = $('h4.font-transcription:contains("Transcripción")')
    .next("div")
    .text()
    .trim();

  return { title, resumen, transcript };
}

async function create_md_file(filename, content) {
  fs.writeFileSync(filename, content);
  return `Archivo ${filename} creado correctamente.`;
}

async function agent(input) {
  while (true) {
    const response = await openai.responses.create({
      model: "gpt-5.4",
      input,
      tools,
    });

    input.push(...response.output);

    let has_function_call = false;
    for (const item of response.output) {
      if (item.type !== "function_call") continue;

      has_function_call = true;

      if (item.name === "get_clip_data") {
        const { digest } = JSON.parse(item.arguments);
        const result = await get_clip_data(digest);

        input.push({
          type: "function_call_output",
          call_id: item.call_id,
          output: JSON.stringify(result),
        });
      }

      if (item.name === "create_md_file") {
        const { filename, content } = JSON.parse(item.arguments);
        const result = await create_md_file(filename, content);

        input.push({
          type: "function_call_output",
          call_id: item.call_id,
          output: result,
        });
      }
    }

    if (!has_function_call) break;
  }

  return input;
}

(async () => {
  const input = [
    {
      role: "system",
      content:
        "Eres un asistente que ayuda a los usuarios a comparar la transcripcion vs. el resumen de los clips de la noticia y generar un archivo MD con una tabla de comparación. Siempre responde en español.",
    },
    {
      role: "user",
      content:
        "Revisa los siguientes clips: 6b219fe6bebd70aacd7f101afb4235f4, 5c14fe6c936369a20c90fcbd85a5b25d, 9679b07ee9c291ab23b97f79837b236b.",
    },
  ];

  const result = await agent(input);

  // save the result to a JSON file
  fs.writeFileSync("agent_02.json", JSON.stringify(result, null, 2));
})();
