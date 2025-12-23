// Script para gerar ícones PWA a partir do logo.jpg
// Requer sharp: npm install sharp --save-dev

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const inputFile = path.join(__dirname, '../public/logo.jpg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    // Verificar se o arquivo de entrada existe
    if (!fs.existsSync(inputFile)) {
      console.error('logo.jpg não encontrado em public/');
      console.log('Criando ícones padrão...');
      
      // Criar ícones simples com texto
      for (const size of sizes) {
        const svg = `
          <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${size}" height="${size}" fill="#0a0a0a"/>
            <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.3}" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" font-weight="bold">T</text>
          </svg>
        `;
        await sharp(Buffer.from(svg))
          .png()
          .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      }
      console.log('Ícones gerados com sucesso!');
      return;
    }

    // Gerar ícones a partir do logo.jpg
    for (const size of sizes) {
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'cover',
          background: { r: 10, g: 10, b: 10, alpha: 1 }
        })
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      
      console.log(`Ícone ${size}x${size} gerado com sucesso!`);
    }
  } catch (error) {
    console.error('Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons();

