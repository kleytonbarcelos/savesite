import express from 'express';
import bodyParser from 'body-parser';
import scrape from 'website-scraper';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/clonar', async (req, res) => {
  const { url } = req.body;

  // Gera um SKU aleatório
  const sku = crypto.randomBytes(4).toString('hex');
  const subDirectory = path.join('websites', sku);

  // Configuração para o website-scraper
  const options = {
    urls: [url],
    directory: subDirectory,
  };

  try {
    await scrape(options);

    // Cria um arquivo zip do conteúdo clonado
    const output = fs.createWriteStream(`${subDirectory}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', async () => {
      console.log('Arquivo zip criado:', archive.pointer(), 'bytes');
      res.download(`${subDirectory}.zip`, async () => {
        // Remove o arquivo zip após o download
        fs.rmSync(`${subDirectory}.zip`);

        // Remove a pasta gerada se ela existir
        if (fs.existsSync(subDirectory)) {
          fs.rmdirSync(subDirectory, { recursive: true });
          console.log('Pasta removida:', subDirectory);
        }
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(subDirectory, false);
    archive.finalize();
  } catch (error) {
    console.error('Erro ao clonar o site:', error.message);
    res.status(500).send('Ocorreu um erro ao clonar o site.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
