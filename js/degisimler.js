const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.getmidas.com/canli-borsa/');

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

  await browser.close();
})();
