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
        //"responseType": "text",
        "responseEncoding": "binary"
    });
    if(ret.status === 200) {
        return ret.data.toString("latin1");
    } else {
        throw new Error(ret.statusText);
    }
}

function getName(s) {    
    const s_artikel_end = [", The", ", Das", ", Der", ", Die"];
    const s_artikel_start = [ "The ", "Das ", "Der ", "Die "];
    let name = s.trim();

    const br_index = name.indexOf("<br>");
    if(br_index != -1) {
        name = name.substring(0, br_index).trim();
    }
    if(name.length > 5) {
        let index;
        for(let i = 0; i < s_artikel_end.length; i++) {
            index = name.indexOf(s_artikel_end[i]);
            if(index !== -1) {
                if(name.length > index + 5 && name[index + 5] === ":") {
                    name = s_artikel_start[i] + name.substring(0, index) + name.substring(index + 5);
                } else {
                    name = s_artikel_start[i] + name.substring(0, index);
                }
                break;
            }
        }
    }
    return name;
}

function getScore(s) {
    const score = s.trim();
    let i = score.indexOf("/");
    if(i !== -1) {
        // 5/10 etc
        const t = score.split("/");
        return Math.floor(parseInt(t[0]) * 100 / parseInt(t[1]));
    }
    i = score.indexOf("%");
    if(i !== -1) {
        // 59% etc
        return parseInt(score.substring(0, i));
    }
    i = score.indexOf("(");
    if(i !== -1) {
        // 4.50 (2) [Userscore]
        const count = parseInt(score.substring(i + 1, score.indexOf(")")));
        if(count >= 10) {
            return Math.floor(parseFloat(score.substring(0, i)) * 10);
        }
    }
    return undefined;
}

async function start(filename) {
    const outpath = path.join(__dirname, "../..", "data");
    const outfile = path.join(outpath, "kultboy.csv");

    const magazines = [ "64er", "Amiga Fever", "Amiga Games", "Amiga Joker", "ASM", "Happy Computer", "Man!ac", "Mega Blast", "Mega Fun", "PC Games", "PC Joker", "PC Player", "Play Time", "Power Play" ];
    const links = [
        { magazine: "64er", id: "37" },
        { magazine: "64er", id: "113" },
        { magazine: "Amiga Fever", id: "38" },
        { magazine: "Amiga Games", id: "3" },
        { magazine: "Amiga Joker", id: "4" },
        { magazine: "ASM", id: "2" },
        { magazine: "Happy Computer", id: "22" },
        { magazine: "Happy Computer", id: "32" },
        { magazine: "Man!ac", id: "75" },
        { magazine: "Mega Blast", id: "15" },
        { magazine: "Mega Fun", id: "52" },
        { magazine: "PC Games", id: "27" },
        { magazine: "PC Joker", id: "7" },
        { magazine: "PC Player", id: "6" },
        { magazine: "Play Time", id: "14" },
        { magazine: "Power Play", id: "1" },
        { magazine: "Video Games", id: "5" }
    ];
    const games = new Map();

    for(let link of links) {
        console.log("parsing " + link.magazine + "...");
        const html = await getHTML("https://www.kultboy.com/index.php?site=testb%2Ftestb&q=&firma=0&orderby=c.wertung&mag=" + link.id + "&discs_art=0&spieltype=1&a=99&system=99&sort=DESC&jahr=0&limit=9999");
        const $ = cheerio.load(html, {
            "decodeEntities": false
        });

        const el_rows = $("#ueberschrift1").next().find("tr");

        let  el_columns, el_link, name, game;
        for(let i = 1; i < el_rows.length; i++) {
            el_columns = el_rows.eq(i).children("td");
            if(el_columns.length === 9) {
                el_link = el_columns.eq(1).find("a").first();
                name = getName(el_link.html());
                game = games.get(name);
                if(game === undefined) {
                    game = {
                        "url": el_link.attr("href").trim(),
                        "user_score": getScore(el_columns.eq(7).text()),
                        "magazines": new Map()
                    };
                }
                game.magazines.set(link.magazine, getScore(el_columns.eq(3).text()));
                games.set(name, game);
            }
        }
    }

    fs.mkdirSync(outpath, { "recursive": true });

    const f = fs.createWriteStream(outfile, {
        flags: "w",
        encoding: "utf8"
    });
    for(const [name, game] of games.entries()) {
        f.write("\"" + escapeString(name) + "\",\"https://www.kultboy.com" + escapeString(game.url) + "\",");
        let score;
        let overall_sum = 0;
        let overall_count = 0;
        for(let magazine of magazines) {
            score = game.magazines.get(magazine);
            if(score === undefined) {
                f.write(",");
            } else {
                overall_sum += score;
                overall_count++;
                f.write(score + ",");
            }
        }
        if(game.user_score === undefined) {
            f.write(",");
        } else {
            f.write(game.user_score + ",");
        }
        if(overall_count > 0) {
            const overall_score = overall_sum / overall_count;
            f.write(overall_score.toFixed(2) + ",");
            if(overall_count > 2) {
                f.write(overall_score.toFixed(2));
            }
        } else {
            f.write(",");
        }
        f.write("\n");
    }
    f.close();
    console.log("created " + outfile);
    let logmsg = "columns: name, link";
    for(let magazine of magazines) {
        logmsg += ", " + magazine;
    }
    logmsg += ", userscore, average, average for >2 scores";
    console.log(logmsg);
}

start("kultboy.csv").then(() => {
    console.log("done");
}).catch(exc => {
    console.error(exc);
})