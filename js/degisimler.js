const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.getmidas.com/canli-borsa/xu050-bist-50-hisseleri');

    await page.waitForSelector('button[class*="btn btn-primary js-close-cookie"]');
    const acceptCookiesButton = await page.$('button[class*="btn btn-primary js-close-cookie"]');
    await acceptCookiesButton.click();

    const rows = await page.$$('table tbody tr');

    const hisseler = [];
    for (const row of rows) {
      const hisse = await row.$eval('td:nth-child(1) a', node => node.textContent.trim());
      const fiyat = await row.$eval('td:nth-child(2)', node => node.textContent.trim());
      const fark = await row.$eval('td:nth-child(5)', node => node.textContent.trim());

      hisseler.push({ "Hisse": hisse, "Fiyat": fiyat, "Fark": fark });
    }

    console.log(hisseler);

    // JSON dosyasını oku
    let jsonContent = fs.readFileSync('../data/hisse_iliskileri.json');
    let data = JSON.parse(jsonContent);

    // Her hisse için fiyat ve fark değerlerini ekle
    for (let i = 0; i < data.hisse_iliskileri.length; i++) {
      let hisse1 = data.hisse_iliskileri[i].hisse1;
      let index1 = hisseler.findIndex(hisse => hisse.Hisse === hisse1);

      if (index1 !== -1) {
        data.hisse_iliskileri[i].fiyat = parseFloat(hisseler[index1].Fiyat.replace(',', '.'));
        data.hisse_iliskileri[i].fark = hisseler[index1].Fark.charAt(0); // Fark değeri string olarak saklanıyor
      }
    }

    // Verileri JSON formatına dönüştür ve dosyaya yaz
    jsonContent = JSON.stringify(data, null, 2);
    fs.writeFileSync('../data/hisse_iliskileri.json', jsonContent);

    console.log("Veriler başarıyla güncellendi.");

    await browser.close();
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    process.exit(1);
  }
})();
