import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import { envs } from '../src/config/envs';

/**
 * Simple CLI to:
 *  - upload a JSONL dataset to OpenAI
 *  - create a fine-tuning job
 *  - check fine-tune job status
 *
 * Usage (PowerShell):
 *   node dist/scripts/openai-finetune.js upload .\\data\\finetune-dreams.jsonl
 *   node dist/scripts/openai-finetune.js create <file_id> --base gpt-4o-mini
 *   node dist/scripts/openai-finetune.js status <job_id>
 */

const client = new OpenAI({ apiKey: envs.OPENAI_API_KEY });

async function main() {
  const [cmd, arg1, arg2, arg3] = process.argv.slice(2);

  if (!cmd || ["upload", "create", "status"].indexOf(cmd) === -1) {
    console.log("Usage:\n  upload <path-to-jsonl>\n  create <training_file_id> [--base <model>]\n  status <job_id>");
    process.exit(1);
  }

  if (cmd === 'upload') {
    const filePath = arg1;
    if (!filePath) throw new Error('upload requires a file path to a JSONL');
    const abs = path.resolve(filePath);
    
    // Verify file exists and has .jsonl extension
    if (!fs.existsSync(abs)) throw new Error(`File not found: ${abs}`);
    if (!abs.endsWith('.jsonl')) throw new Error('File must have .jsonl extension');
    
    const stream = fs.createReadStream(abs);
    const up = await client.files.create({ file: stream as any, purpose: 'fine-tune' });
    console.log('Uploaded file id:', up.id);
    return;
  }

  if (cmd === 'create') {
    const training_file = arg1;
    if (!training_file) throw new Error('create requires <training_file_id>');

    // Parse --base <model> from args
    let baseModel = 'gpt-3.5-turbo';
    const baseArgIndex = process.argv.findIndex(v => v === '--base');
    if (baseArgIndex !== -1 && process.argv.length > baseArgIndex + 1) {
      baseModel = process.argv[baseArgIndex + 1];
    }

    const job = await client.fineTuning.jobs.create({
      model: baseModel,
      training_file,
    });
    console.log('Created job id:', job.id, 'status:', job.status);
    return;
  }

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
