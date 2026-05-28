# agentes-ia

Este repo contiene **ejemplos didácticos** de diferentes “niveles” al usar modelos: desde **prompts simples** hasta **agentes** que iteran y usan herramientas (function calling).

## Prompts (`prompt_*.js`)
- `prompt_01.js`: **Prompt único** (una sola llamada) para generar texto.
- `prompt_02a.js`: **Salida JSON** usando modo JSON (`json_object`) para obtener un objeto estructurado.
- `prompt_02b.js`: **Structured Outputs con Zod** (validación/shape estricto) para extraer un JSON con esquema.
- `prompt_03.js`: **Prompts secuenciales** (pipeline): limpiar texto → extraer datos con esquema → generar título y resumen.

## Agentes (`agent_*.js`)
- `agent_01.js`: **Agente con 1 tool** (`get_clip_data`) que consulta clips, itera hasta resolver function calls y guarda el rastro en `agent_01.json`.
- `agent_02.js`: **Agente con 2 tools** (`get_clip_data` + `create_md_file`) para comparar transcripción vs resumen y generar un `.md`; guarda el rastro en `agent_02.json`.
- `agent_03.js`: **Agente iterativo “generar → evaluar → corregir”** para títulos periodísticos, con límite de iteraciones y evaluación estructurada.

## Notas rápidas
- **Config**: copia `.env_template` a `.env` y agrega tu API key.
- **Ejecución**: son scripts Node.js; típicamente se corren con `node <archivo>.js` (después de instalar dependencias).