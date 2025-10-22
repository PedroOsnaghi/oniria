import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import { envs } from '../src/config/envs';

const client = new OpenAI({ apiKey: envs.OPENAI_API_KEY });

  //cmd es el comando principal: upload <path-to-jsonl> | create <training_file_id> [--base <model>] | status <job_id>

async function main() {
  const [cmd, arg1] = process.argv.slice(2);

  //validacion de comandos

  if (!cmd || ["upload", "create", "status"].indexOf(cmd) === -1) {
    console.log("Usage:\n  upload <path-to-jsonl>\n  create <training_file_id> [--base <model>]\n  status <job_id>");
    process.exit(1);
  }

  //comando upload

  if (cmd === 'upload') {
    const filePath = arg1;
    if (!filePath) throw new Error('upload requires a file path to a JSONL');
  const abs = path.resolve(filePath);

  //chequeo de archivo

    if (!fs.existsSync(abs)) throw new Error(`File not found: ${abs}`);
  if (!abs.endsWith('.jsonl')) throw new Error('File must have .jsonl extension');

  //creacion de stream de lectura del archivo
    const stream = fs.createReadStream(abs);
  //metodo de openai para subir el archivo
    const up = await client.files.create({ file: stream as any, purpose: 'fine-tune' });
    console.log('Uploaded file id:', up.id);
    return;
  }

  //comando create
  if (cmd === 'create') {
    const training_file = arg1;
    if (!training_file) throw new Error('create requires <training_file_id>');

  //parseo de --base <model> (opcional)
    let baseModel = 'gpt-3.5-turbo';
    const baseArgIndex = process.argv.findIndex(v => v === '--base');
    if (baseArgIndex !== -1 && process.argv.length > baseArgIndex + 1) {
      baseModel = process.argv[baseArgIndex + 1];
    }

    //creacion del job de fine-tuning, pasamos el model y el archivo de entrenamiento
    const job = await client.fineTuning.jobs.create({
      model: baseModel,
      training_file,
    });
    console.log('Created job id:', job.id, 'status:', job.status);
    return;
  }

  //devuelve el status del proceso de fine-tuning
  if (cmd === 'status') {
    const job_id = arg1;
    if (!job_id) throw new Error('status requires <job_id>');
    const job = await client.fineTuning.jobs.retrieve(job_id);
    console.log('Job:', job.id, 'status:', job.status, 'model:', job.fine_tuned_model);
    return;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
