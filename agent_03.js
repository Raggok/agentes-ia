import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

import OpenAI from "openai";
const openai = new OpenAI();

async function generate_title(text) {
  const response = await openai.responses.create({
    model: "gpt-5.4",
    input: [
      {
        role: "system",
        content:
          "Eres un asistente que ayuda a los usuarios a generar un titulo para una noticia. Siempre responde en español.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return response.output[0].content[0].text;
}

const EvaluationSchema = z.object({
  approved: z.boolean(),
  problems: z.array(z.string()),
});

const skill = `
  - El titulo debe ser un resumen claro y conciso de la noticia.
  - El titulo debe ser corto y directo.
  - El titulo debe ser emocional.
  - El titulo debe ller un titulo que sea atractivo y interesante para el lector.
`;

async function evaluate_title(text, title) {
  const response = await openai.responses.create({
    model: "gpt-5.4",
    input: [
      {
        role: "system",
        content: `Eres un editor periodístico que ayuda a los usuarios a evaluar un titulo para una noticia. Eres muy semi-estricto con el contenido y el formato. Siempre responde en español.\n\n${skill}`,
      },
      {
        role: "user",
        content: `Texto: ${text}\nTitulo: ${title}`,
      },
    ],
    text: { format: zodTextFormat(EvaluationSchema, "EvaluationSchema") },
  });

  return JSON.parse(response.output[0].content[0].text);
}

async function fix_title(text, fix_title, problems) {
  const response = await openai.responses.create({
    model: "gpt-5.4",
    input: [
      {
        role: "system",
        content:
          "Eres un editor periodístico que ayuda a los usuarios a corregir un titulo para una noticia. Siempre responde en español.\n Solo responde el titulo corregido, no otro texto.",
      },
      {
        role: "user",
        content: `Texto: ${text}\nTitulo a corregir: ${fix_title}\nProblemas: ${problems.join(
          ", "
        )}`,
      },
    ],
  });

  return response.output[0].content[0].text;
}

async function agent(text) {
  let title = await generate_title(text);
  console.log(`✅ Titulo generado: ${title}`);

  const maxIterations = 3;
  for (let i = 0; i < maxIterations; i++) {
    const evaluation = await evaluate_title(text, title);

    if (evaluation.approved) {
      console.log(`✅ Titulo aprobado en iteración ${i + 1}\n`);
      break;
    }

    console.log(`❌ No aprobado. Problemas:`);
    evaluation.problems.forEach((p) => console.log(`   - ${p}`));

    if (i === maxIterations - 1) {
      console.warn(
        "⚠️ Límite de iteraciones alcanzado, se entrega el último intento\n"
      );
      break;
    }

    title = await fix_title(text, title, evaluation.problems);
    console.log(`✅ Titulo corregido: ${title}`);
  }

  return title;
}

(async () => {
  const text = `Advierten cambiar la seguridad en internet
RUBÉN ARIZMENDI
El presidente de la Comisión de Derechos Digitales del Senado de la República, Luis Donaldo Colosio Riojas, hizo un llamado a fortalecer las capacidades técnicas y regulatorias del Estado mexicano para enfrentar los retos de la seguridad en entornos digitales.
Subrayó la urgencia de que el sector privado asuma un papel activo en el diseño y operación de plataformas seguras, al tiempo que destacó la necesidad de construir una ciudadanía informada, capaz de ejercer sus derechos digitales y prevenir riesgos en línea.
MÉXICO, CON OPORTUNIDAD EN SEGURIDAD DIGITAL
Al inaugurar el curso "Derecho a la seguridad ciudadana en el ecosistema digital", el legislador de Movimiento Ciudadano dejó en claro que México tiene una oportunidad clave para transitar hacia un modelo de seguridad digital preventivo, que no se limite a sancionar, sino que genere condiciones para evitar daños, fomentar buenas prácticas y fortalecer tanto a instituciones como a usuarios.
"El objetivo es construir un entorno donde la tecnología deje de ser una fuente de vulnerabilidad y se convierta en una herramienta de desarrollo, conexión y prosperidad".
Del Partido Verde Ecologista de México, Juanita Guerra Mena destacó el compromiso del Senado de la República para impulsar leyes claras que garanticen una ciberseguridad ética, proporcional y respetuosa de la privacidad.
El legislador de Movimiento Ciudadano participó en 'Derecho a la seguridad ciudadana en el ecosistema digital'.`;

  const title = await agent(text);

  console.log(`Titulo Final: ${title}`);
})();
