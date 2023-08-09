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

app.get('/', (req, res) => {
  res.send('Bem-vindo à página de clonagem de site!');
});

app.post('/save', async (req, res) => {
  const { url } = req.body;

  // Obtém o nome do site a partir da URL
  const siteName = getSiteName(url);
  const subDirectory = path.join('websites', siteName);

  // Configuração para o website-scraper
  const options = {
    urls: [url],
    directory: subDirectory,
  };

  try {
    await scrape(options);

    // Cria um arquivo zip do conteúdo clonado
    const output = fs.createWriteStream(`${siteName}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', async () => {
      console.log('Arquivo zip criado:', archive.pointer(), 'bytes');
      res.download(`${siteName}.zip`, async () => {
        // Remove o arquivo zip após o download
        fs.rmSync(`${siteName}.zip`);

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
    console.error('Erro ao salvar o site:', error.message);
    res.status(500).send('Ocorreu um erro ao salvar o site.');
  }
});

function getSiteName(url) {
  const domain = new URL(url).hostname;
  const siteName = domain.replace(/^www\./, '').replace(/\./g, '-').replace(/\.com$/, '');
  return siteName;
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
