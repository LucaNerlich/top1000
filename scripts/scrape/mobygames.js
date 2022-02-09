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

async function start(filename, startyear, endyear) {
    const outpath = path.join(__dirname, "../..", "data");
    const outfile = path.join(outpath, filename);
    fs.mkdirSync(outpath, { "recursive": true });

    const games = new Map();
    let count = 0;

    const regex_ziffern = /\d+/;
    const regex_year = /release-info">.*?(\d+)<\/a>/;
    
    for(let year = startyear; year <= endyear; year++) {
        let max = 1;
        let offset = 0;

        console.log("parsing year " + year + "...");

        try {
            while(offset < max) {
                const html_list = await getHTML("https://www.mobygames.com/browse/games/" + year + "/offset," + offset + "/so,0a/list-games/");
                const $ = cheerio.load(html_list, {
                    "decodeEntities": false
                });
                const el_container = $("#main>div").children().eq(1).children();
                if(max < 25) {
                    max = parseInt(el_container.eq(0).text().match(/\(([0-9]+) games\)/)[1]);
                    if(Number.isNaN(max) || max <= 0 || max > 10000) {
                        console.error("failed to parse max");
                        continue;
                    }
                }
                const el_rows = el_container.eq(1).find("#mof_object_list>tbody tr");
                for(let i = 0; i < el_rows.length; i++) {
                    try {
                        const el_a = el_rows.eq(i).children("td").eq(0).find("a");
                        const url = el_a.attr("href");
                        const name = el_a.html().trim();

                        const html = await getHTML(url + "/view-moby-score");
                        const $2 = cheerio.load(html, {
                            "decodeEntities": false
                        });

                        const el_row = $2("#main table.scoreWindow tr.color3");
                        if(el_row.length > 0) {
                            const el_columns = el_row.first().children("td");
                
                            const votes = parseInt(el_columns.eq(0).find("small").first().text().match(regex_ziffern)[0]);
                            const score = parseFloat(el_columns.eq(1).text());
                            
                            if(!(Number.isNaN(votes) || Number.isNaN(score) || votes <= 0 || score < 0 || score > 10)) {
                                if(votes >= 10) {
                                    const year = parseInt($2("#coreGameRelease").html().match(regex_year)[1]);
                                    const norm_score = score * 100 / 5;
                                    const index = url.lastIndexOf("/");
                                    const game_id = url.substring(index + 1);
                                    if(!games.has(game_id)) {
                                        games.set(game_id, {
                                            "name": escapeString(name),
                                            "votes": votes,
                                            "score": norm_score.toFixed(2),
                                            "year": year
                                        });
                                        console.log(name + ": " + score + " (" + votes + ")");
                                        count++;
                                    }                                    
                                }
                            }
                        }
                    } catch(exc) {
                        console.error(exc);
                    }
                }
                offset += 25;
            }
        } catch(exc) {
            console.error(exc);
        }
    }

    console.log(count + " games with 10 or more user votes found.");
    if(count > 0) {
        const f = fs.createWriteStream(outfile, {
            flags: "w",
            encoding: "utf8"
        });
        for(const [id, game] of games.entries()) {
            f.write("\"" + game.name + "\"," + game.year + ",\"https://www.mobygames.com/game/" + id + "\"," + game.votes + "," + game.score + "\n");
            count++;
        }    
        console.log("created " + outfile);
        f.close();
    }
}

start("mobygames.csv", 1975, 1989).then(() => {
    console.log("done");
}).catch(exc => {
    console.error(exc);
});