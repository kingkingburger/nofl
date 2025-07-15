
import { createWriteStream } from 'fs';
import { get } from 'https';
import { resolve } from 'path';
import extract from 'extract-zip';

const modelUrl = 'https://alphacephei.com/vosk/models/vosk-model-small-ko-0.22.zip';
const modelDir = resolve(process.cwd(), 'public', 'vosk-model-ko-0.22-small');
const zipPath = resolve(process.cwd(), 'vosk-model.zip');

console.log('Downloading Vosk model...');
const file = createWriteStream(zipPath);
get(modelUrl, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download complete. Extracting...');
    extract(zipPath, { dir: modelDir }).then(() => {
      console.log('Model extracted successfully.');
    }).catch(err => {
      console.error('Error extracting model:', err);
    });
  });
}).on('error', (err) => {
  console.error('Error downloading model:', err);
});
