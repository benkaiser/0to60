import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as fs  from 'fs';

interface ModelVariant {
  year: string,
  zeroToSixty?: string,
  quarterMile?: string
}

interface Model {
  name: string,
  variants: {
    [variant: string]: ModelVariant
  }
}

interface Make {
  name: string,
  brandIcon: string,
  url: string,
}

interface MakeWithModels extends Make {
  models: Model[]
}

console.log('Loading makes');

const makes: Make[] = JSON.parse(fs.readFileSync('makes.json', 'utf8'));

(async () => {
  const makesWithModels: MakeWithModels[] = [];
  for (let x: number = 0; x < makes.length; x++) {
    makesWithModels.push(await fetchMakeInformation(makes[x]));
  }
  console.log('Done');
  console.log(`Wrote ${makesWithModels.length} makes with ${countModels(makesWithModels)} models to file makes_models.json`);
  fs.writeFileSync('makes_models.json', JSON.stringify(makesWithModels, null, 2), 'utf8');
})();

function countModels(makesWithModesl: MakeWithModels[]): number {
  return makesWithModesl.reduce((incrementer, make) => incrementer + make.models.length, 0);
}

const zeroToSixtyMatcher: RegExp = /.*0-60 mph\s*(?<zeroToSixty>[\d.]*).*/;
const quarterMileMatcher: RegExp = /.*Quarter mile\s*(?<quarterMile>[\d.]*).*/;

async function fetchMakeInformation(make: Make): Promise<MakeWithModels> {
  console.log(make.name);
  console.log('> Fetching');
  return fetch(make.url)
  .then(response => response.text())
  .then(responseHtml => {
    console.log('> Parsing');
    const $ = cheerio.load(responseHtml);
    const modelElements: CheerioElement[] = $('.stats__list__accordion').toArray();
    const models: Model[] = modelElements.map(element => {
      const name = $(element).find('.stats__list__accordion__header__title__vehicle-make').text().trim();
      const instanceElements: CheerioElement[] = $(element).find('.stats__list__accordion__body__stat').toArray();
      const variantMap: { [variant: string]: ModelVariant } = {};
      instanceElements.forEach(instanceElement => {
        const nameText: string = $(instanceElement).find('.stats__list__accordion__body__stat__top__title').text().trim();
        const timesText: string = $(instanceElement).find('.stats__list__accordion__body__stat__top__right').text().trim().replace(/\n/g, '');
        const year: string = '' + parseInt(nameText);
        const zeroToSixtyMatches: RegExpExecArray = zeroToSixtyMatcher.exec(timesText);
        const quarterMileMatches: RegExpExecArray = quarterMileMatcher.exec(timesText);
        const zeroToSixty: string = zeroToSixtyMatches?.groups['zeroToSixty'] || undefined;
        const quarterMile: string = quarterMileMatches?.groups['quarterMile'] || undefined;
        if (zeroToSixty || quarterMile) {
          const item: ModelVariant = {
            year: year
          };
          zeroToSixty && (item.zeroToSixty = zeroToSixty);
          quarterMile && (item.quarterMile = quarterMile);
          variantMap[nameText] = item;
        }
      });
      return {
        name,
        variants: variantMap
      };
    });
    console.log('> Found ' + models.length + ' models');
    return {
      ...make,
      models
    };
  });
}

