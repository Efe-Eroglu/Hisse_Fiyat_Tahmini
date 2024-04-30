const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchDataAndSave() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.getmidas.com/canli-borsa/xu050-bist-50-hisseleri', {
      waitUntil: 'domcontentloaded',
      timeout: 0
    });

    await page.waitForSelector('table tbody tr');

    const hisseler = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const hisse = row.querySelector('td:nth-child(1) a').textContent.trim();
        const fiyat = row.querySelector('td:nth-child(2)').textContent.trim();
        const fark = row.querySelector('td:nth-child(5)').textContent.trim();
        return { "hisse": hisse, "fiyat": fiyat, "fark": fark };
      });
    });

    fs.writeFileSync('../data/fiyatlar.json', JSON.stringify(hisseler, null, 2));

    console.log("Veriler başarıyla kaydedildi.");
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await browser.close();
  }
}

fetchDataAndSave();

setInterval(fetchDataAndSave, 10000); // Her 10 saniyede bir veri alıp kaydet
