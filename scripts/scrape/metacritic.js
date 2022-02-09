const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

function escapeString(s) {
    // not ideal, but hopefully good enough...
    return s.replace(/("|\\)/g, "\\$1");
}

async function getHTML(url) {
    const ret = await axios({
        "url": url,
        "method": "get",
        "responseEncoding": "binary"
    });
    if(ret.status === 200) {
        return ret.data.toString("utf8");
    } else {
        throw new Error(ret.statusText);
    }
}

async function start(filename) {
    const outpath = path.join(__dirname, "../..", "data");
    const outfile = path.join(outpath, filename);

    const games = new Map();
    for(let i = 0; i <= 191; i++) {
        if(i > 0 && i % 5 === 0) {
            console.log( i + " pages parsed...");
        }

        const html = await getHTML("https://www.metacritic.com/browse/games/score/metascore/all/all/filtered?view=condensed&page=" + i);
        const $ = cheerio.load(html, {
            "decodeEntities": false
        });

        const el_rows = $("#main_content div.content_after_header").find("tr");

        let el_columns, el_details, score, link, nr, name, platform, date, year, game;
        for(let i = 0; i < el_rows.length; i++) {
            el_columns = el_rows.eq(i).children("td");
            el_details = el_columns.eq(1);

            score = parseInt(el_columns.eq(0).find("div").first().text());
            link = el_details.find("a.title").first().attr("href").trim().replace(/","/g, "\\\"");
            nr = parseInt(el_details.find("span.title").first().text());
            name = el_details.find("h3").first().text().trim().replace(/","/g, "\\\"");
            platform = el_details.find("div.platform span.data").first().text().trim().replace(/","/g, "\\\"");
            date = el_details.find(">span").first().text().trim().replace(/","/g, "\\\"");
            year = parseInt(date.match(/[0-9]{4}/)[0]);

            game = games.get(name);
            if(game === undefined) {
                game = {
                    "platforms": new Map(),
                    "year": year,
                    "link": link
                };
            }
            game.platforms.set(platform, {
                "link": link,
                "nr": nr,
                "date": date,
                "score": score
            });
            if(year < game.year) {
                game.year = year;
                game.link = link;
            }
            games.set(name, game);
        }
    }

    fs.mkdirSync(outpath, { "recursive": true });

    const f = fs.createWriteStream(outfile, {
        flags: "w",
        encoding: "utf8"
    });

    let count = 0;
    for(const [name, game] of games.entries()) {
        f.write("\"" + escapeString(name) + "\"," + game.year + ",https://www.metacritic.com" + game.link + ",");
        let overall_sum = 0;
        let overall_count = 0;
        for(const [platform, data] of game.platforms.entries()) {
            overall_sum += data.score;
            overall_count++;
        }
        const overall_score = overall_sum / overall_count;
        f.write(overall_score.toFixed(2));
        f.write("\n");
        count++;
    }

    f.close();
    console.log("created " + outfile);
    console.log(count + " games found");
}

start("metacritic.csv").then(() => {
    console.log("done");
}).catch(exc => {
    console.error(exc); 
})