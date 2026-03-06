import fs from "fs";
import path from "path";
import "dotenv/config";

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

if (!FIGMA_TOKEN) {
  console.error("❌ Hata: .env dosyasında FIGMA_TOKEN bulunamadı.");
  process.exit(1);
}

const args = process.argv.slice(2);
const url = args[0];

if (!url) {
  console.error(
    "❌ Kullanım: npx tsx src/scripts/figma-extractor.ts <FIGMA_URL>",
  );
  process.exit(1);
}

// Figma Linkini Parse Et (File ID ve varsa Node ID'yi çıkar)
// Örnek URL formats:
// figma.com/design/XXXXX/Name?node-id=YYY-ZZZ
// figma.com/file/XXXXX/Name?node-id=YYY-ZZZ
const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
if (!match) {
  console.error("❌ Geçersiz Figma URL'si girdiniz.");
  process.exit(1);
}

const fileKey = match[1];
const urlObj = new URL(url);
const nodeId = urlObj.searchParams.get("node-id"); // optional node id

async function extract() {
  console.log(`🔍 Figma API'a bağlanılıyor...`);
  console.log(`   📂 File Key: ${fileKey}`);

  let endpoint = `https://api.figma.com/v1/files/${fileKey}`;
  if (nodeId) {
    console.log(`   🧩 Node ID: ${nodeId}`);
    // Sadece spesifik componentin/parçanın detayını çek
    endpoint = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`;
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        "X-Figma-Token": FIGMA_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API Hatası döndürdü - ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Geçici bir dosyaya sonucu formatlayarak yazıp inceleyeceğiz.
    const outPath = path.join(process.cwd(), "tmp_figma_output.json");
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

    console.log(
      `✅ Başarılı! Figma'dan gelen JSON verisi kaydedildi: ${outPath}`,
    );
    console.log(
      `\nArtık bu JSON'ı inceleyerek (yapısını anlayarak) React koduna dönüştürecek mantığı kurabiliriz.`,
    );
  } catch (err: any) {
    console.error("❌ Veri çekimi başarısız:", err.message);
  }
}

extract();
