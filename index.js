import scrape from 'website-scraper';
//import defaultOptions from 'website-scraper/defaultOptions';
import SaveToExistingDirectoryPlugin from 'website-scraper-existing-directory';
import { zip } from 'zip-a-folder';
import fs from 'fs-extra'

import express from 'express'
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/make/:url', (req, res) => {
  let response = convert(req.params.url)
  res.send('hello world: '+response)
})

app.listen(port, () => {
  console.log(`>>> Example app listening on port ${port}`)

  convert('https://metodovidasaudavel.com/')
})

const convert = async (url) => {
  console.log('==========================================================')
  console.log('STARTING....')

  const prettifyUrls = true
  // let url = ''
  // url = 'https://curcumy.info'
  // url = 'https://curcumy.info/'
  // url = 'https://paginadasaude.com.br/instituto-plano-de-menina-e-bayer-promovem-evento-gratuito-sobre-saude-feminina-na-share-student-living-butanta-neste-sabado/'
  // url = 'https://www.g1.com.br'
  // url = 'https://www.hola.com/actualidad/20230122225024/shakira-pique-hijo-milan-cumpleanos/'
  //url = 'https://icloakerpro.com/site/'
  // url = 'https://oliveirassomerville.com'

  const folderSite = (Math.round((Math.pow(36, 10 + 1) - Math.random() * Math.pow(36, 10))).toString(36).slice(1))
  const dir = './websites/'+folderSite

  fs.mkdirSync(dir)

  let response = await scrape({
    urls: [url],
    directory: dir,
    plugins: [ new SaveToExistingDirectoryPlugin() ],
    // defaultFilename: 'home.html',
    // filenameGenerator: 'bySiteStructure',
    // urlFilter: function (url) {
    //     return url.indexOf(websiteUrl) === 0;
    // },
    //recursive: true,
    prettifyUrls,
    // request: {
    //     headers: {
    //         'User-Agent': 'Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19'
    //     }
    // },
    // subdirectories: [
    // 	{ directory: 'assets/images', extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    // 	{ directory: 'assets/js', extensions: ['.js'] },
    // 	{ directory: 'assets/css', extensions: ['.css'] },
    // 	{ directory: 'assets/media', extensions: ['.mp4', '.mp3', '.ogg', '.webm', '.mov', '.wave', '.wav', '.flac'] },
    // 	{ directory: 'assets/fonts', extensions: ['.ttf', '.woff', '.woff2', '.eot', '.svg'] }
    // ],
  })

  try {
    if(response){
      let zipFolder = new URL(url).hostname
      let date = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split(".")[0].replace(/[T:]/g, '').replace(/[T-]/g, '')
      let zipFile = './websites/'+zipFolder+'_'+date+'.zip'
      zip(dir, zipFile)
      console.log( "Entire website succesfully downloaded>> "+zipFile )
      //zip.compressFolder(dir, './websites/'+zipFolder+'.zip');
    }
  } catch (error) {
    console.log("An error ocurred", error);
  }  
  console.log('END')
  console.log('==========================================================')
}