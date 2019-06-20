import * as request from 'request-promise';
import * as readline from 'readline-sync';
import * as querystring from 'querystring';
import * as fs from 'fs';

const chars = ['a','b','c','č','d','e','f','g','h','i','j','k','l','m','n','o','p','r','s','š','t','u','v','z','ž'];
interface DataResponse {
  DepartureStations: Station[],
  Error: string,
  ErrorMsg: string
}
interface Station {
  JPOS_IJPP: number,
  POS_NAZ: string
}

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/*
GET
https://prometws.alpetour.si/WS_ArrivaSLO_TimeTable_DepartureStations.aspx?
JSON=1&SearchType=2&cTOKEN=874502b99ae1a76bbd25a29531310ae0&cTIMESTAMP=20190620175713&POS_NAZ=ab
JSON=1&SearchType=2&cTOKEN=874502b99ae1a76bbd25a29531310ae0&cTIMESTAMP=20190620175713&POS_NAZ=abc
*/
async function scrape(URL: string) {
  let [hostname, query] = URL.split('?');
  let queryArgs: any = querystring.parse(query);
  let stations: Station[] = [];

  try {
    for (let i = 0; i < 3; i++) {
      queryArgs.POS_NAZ = chars[i];
      console.log(queryArgs.POS_NAZ);
      let raw: string = await request.get({url: hostname, qs: queryArgs});
      let res: DataResponse[] = JSON.parse(raw);

      res && res.forEach((data: DataResponse) => {
        stations = stations.concat(data.DepartureStations);
      });
      
      await sleep(500);
    }

    fs.writeFileSync("avtobusne_postaje.json", JSON.stringify(stations));
  } catch(err) {
    console.log(err);
  }
}

scrape(readline.question('Enter url: '));