import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as fs  from 'fs';

interface Make {
  name: string,
  brandIcon: string,
  url: string
}

console.log('Requesting makes');
fetch('https://www.zeroto60times.com/browse-by-make/')
.then(response => response.text())
.then(responseHtml => {
  console.log('Parsing response');
  const $ = cheerio.load(responseHtml);
  const makeElements: CheerioElement[] = $('.by-make__logos__link').toArray();
  const makes: Make[] = makeElements.map(element => {
    return {
      url: element.attribs['href'],
      name: $(element).text().trim(),
      brandIcon: $(element).find('img').attr('src')
    };
  });
  fs.writeFileSync('makes.json', JSON.stringify(makes, null, 2), 'utf8');
  console.log(`Wrote ${makes.length} makes to file makes.json`);
});