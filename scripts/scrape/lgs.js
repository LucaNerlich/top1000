const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { decode } = require("html-entities");

const outpath = path.join(__dirname, "../..", "data");

async function get(what) {
    const ret = await axios({
        "url": "https://forum.lastgamestanding.de/" + what,
        "method": "get",
        "responseType": "json",
    });
    if(ret.status === 200) {
        return ret.data;
    } else {
        throw new Error(ret.statusText);
    }
}

function getString(s) {
    let r = decode(s);
    r = r.replace(/(<([^>]+)>)/ig, "").trim();
    r = r.replace(/"|\t/g," ");
    r = r.replace(/[ ]+/g," ");
    if(r.indexOf(",") !== -1) {
        return "\"" + r + "\"";
    } else {
        return r;
    }
}

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

const staffeln = [
    { "nr": 9, "name": "Bestes Gamesbundesland", "topics": [ { "stage": "Finale", "id": 1861 }, { "stage": "Halfinale", "id": 1854 }, { "stage": "Halfinale", "id": 1855 }, { "stage": "Viertelfinale", "id": 1851 }, { "stage": "Viertelfinale", "id": 1852 }, { "stage": "Viertelfinale", "id": 1853 }, { "stage": "Viertelfinale", "id": 1850 }, { "stage": "Achtelfinale", "id": 1838 }, { "stage": "Achtelfinale", "id": 1834 }, { "stage": "Achtelfinale", "id": 1815 }, { "stage": "Achtelfinale", "id": 1792 }, { "stage": "Achtelfinale", "id": 1776 }, { "stage": "Achtelfinale", "id": 1769 }, { "stage": "Achtelfinale", "id": 1755 }, { "stage": "Achtelfinale", "id": 1748 }, { "stage": "Bonus", "id": 1858 } ] },
    { "nr": 8, "name": "Bester NPC", "topics": [{ "stage": "Finale", "id": 1651 }, { "stage": "Halbfinale", "id": 1648 }, { "stage": "Halbfinale", "id": 1647 }, { "stage": "Viertelfinale", "id": 1632 }, { "stage": "Viertelfinale", "id": 1620 }, { "stage": "Viertelfinale", "id": 1609 }, { "stage": "Viertelfinale", "id": 1558 }, { "stage": "Community-Picks", "id": 1604 } ]},
    { "nr": 7, "name": "Bestes Strategiespiel", "topics": [{ "stage": "Finale", "id": 1410 }, { "stage": "Halbfinale", "id": 1395 }, { "stage": "Viertelfinale", "id": 1380 }, { "stage": "Viertelfinale", "id": 1378 }, { "stage": "Viertelfinale", "id": 1379 }, { "stage": "Viertelfinale", "id": 1375 }, { "stage": "Achtelfinale", "id": 1364 }, { "stage": "Achtelfinale", "id": 1334 }, { "stage": "Achtelfinale", "id": 1321 }, { "stage": "Achtelfinale", "id": 1279 }, { "stage": "Achtelfinale", "id": 1311 }, { "stage": "Achtelfinale", "id": 1252 }, { "stage": "Achtelfinale", "id": 1355 }, { "stage": "Achtelfinale", "id": 1340 } ]},
    { "nr": 6, "name": "Beste Designerin", "topics": [{ "stage": "Finale", "id": 1204 }, { "stage": "Halbfinale", "id": 1202 }, { "stage": "Viertelfinale", "id": 1189 }, { "stage": "Viertelfinale", "id": 1160 }, { "stage": "Viertelfinale", "id": 1144 }, { "stage": "Viertelfinale", "id": 1131 }, ]},
    { "nr": 5, "name": "Bestes Spiel des Jahrzehnts", "topics": [{ "stage": "Finale", "id": 924 }, { "stage": "Halbfinale", "id": 917 }, { "stage": "Viertelfinale", "id": 853 }, { "stage": "Viertelfinale", "id": 861 }, { "stage": "Viertelfinale", "id": 860 }, { "stage": "Viertelfinale", "id": 849 }, { "stage": "Achtelfinale", "id": 750 }, { "stage": "Achtelfinale", "id": 617 }, { "stage": "Achtelfinale", "id": 713 }, { "stage": "Achtelfinale", "id": 664 }, { "stage": "Achtelfinale", "id": 687 }, { "stage": "Achtelfinale", "id": 586 }, { "stage": "Achtelfinale", "id": 767 }, { "stage": "Achtelfinale", "id": 800 }, { "stage": "Community Picks", "id": 585 }, { "stage": "Stichwahl zur Abstimmung über das Abtimmungsprozedere bezüglich der Community-Picks", "id": 574 }]},
    { "nr": 4, "name": "Bestes Spielejahr", "topics": [{ "stage": "Finale", "id": 512 }, { "stage": "Halbfinale", "id": 506 }, { "stage": "Viertelfinale", "id": 471 }, { "stage": "Viertelfinale", "id": 415 }, { "stage": "Viertelfinale", "id": 451 }, { "stage": "Viertelfinale", "id": 439 }, { "stage": "Community Wildcards", "id": 418 }]},
    { "nr": 3, "name": "Überschätztestes Spiel", "topics": [{ "stage": "Finale", "id": 392 }, { "stage": "Halbfinale", "id": 372 }, { "stage": "Viertelfinale", "id": 316 }, { "stage": "Viertelfinale", "id": 359 }, { "stage": "Viertelfinale", "id": 343 }, { "stage": "Viertelfinale", "id": 293 }, { "stage": "Community Wildcard", "id": 294 }]},
    { "nr": 2, "name": "Bester zweiter Teil", "topics": [{ "stage": "Finale", "id": 268 }, { "stage": "Halbfinale", "id": 265 }, { "stage": "Halbfinale", "id": 231 }, { "stage": "Viertelfinale", "id": 170 }, { "stage": "Viertelfinale", "id": 210 }, { "stage": "Viertelfinale", "id": 187 }, { "stage": "Viertelfinale", "id": 154 }, { "stage": "Indie-Edition: Nidhogg 2 vs Thirty Flights of Loving", "id": 321 }, { "stage": "Welches Spiel aus dieser Staffel habt ihr zuletzt gespielt?", "id": 256 }]},
    { "nr": 1, "name": "Beste Story", "topics": [{ "stage": "Finale", "id": 137 }, { "stage": "Halbfinale", "id": 124 }, { "stage": "Halbfinale", "id": 103 }, { "stage": "Viertelfinale", "id": 90 }, { "stage": "Viertelfinale", "id": 61 }, { "stage": "Viertelfinale", "id": 51 }, { "stage": "Viertelfinale", "id": 19 }, { "stage": "Welches Spiel haben wir vergessen?", "id": 25 }]},
    { "nr": "-", "name": "Bonusfolge", "topics": [{ "stage": "Geilste Gaming-Aktie", "id": 534 }, { "stage": "Beste Fehlwertung", "id": 1717 }, { "stage": "Wird das geil? Die E3-Edition", "id": 1697 }, { "stage": "Beste Kneipe!", "id": 1677 }, { "stage": "Bestes JRPG für Normies!", "id": 1674 }, { "stage": "Was ist dümmer? Cyberpunk 2077 eine 9.6 geben - oder zu wenig Impfstoff bestellen?", "id": 1501 }, { "stage": "Das nervigste Wort im deutschen Spielejournalismus", "id": 1471 }, { "stage": "Beste The Sims-Erweiterung", "id": 1476 }, { "stage": "Beste Cyberpunk 2077-Rezension", "id": 1495 }, { "stage": "Bester Flop?", "id": 1450 }, { "stage": "Bestes Gaming-Abo?", "id": 461 }, { "stage": "Geilste Gaming-Aktie Oktober 2020", "id": 1446 }, { "stage": "Das ungerechteste Spiel", "id": 1039 }, { "stage": "Was ist das beste Podcastspiel?", "id": 1029 }, { "stage": "Was ist der beste Wald?", "id": 991 }, { "stage": "So werden die 20er Jahre! (ganz bestimmt)", "id": 920 }, { "stage": "Deutschestes Spiel?", "id": 1013 }, { "stage": "Bestes Besäufnis in einem Computerspiel?", "id": 817 }, { "stage": "Bester Charakter-Editor", "id": 832 }, { "stage": "Wer ist der Rollenspiel-Messias? Disco Elysium oder The Outer Worlds", "id": 669 }, { "stage": "Bestes Kater-Spiel", "id": 537 }, { "stage": "Lost Levels vs. Indie Fresse", "id": 414 }, { "stage": "Wer hat die E3 gewonnen?", "id": 315 }, { "stage": "Freundschaftsspiel: Bestes Fußballspiel aller Zeiten?", "id": 180 }, { "stage": "Was ist geiler? Fallout 76 oder Anthem?", "id": 134 }, { "stage": "Beste Gamescom-Halle", "id": 500 }, { "stage": "Crossover: Der NPC als Meme", "id": 1597 }]},
    { "nr": "-", "name": "Wer hat den Gürtel", "topics": [{ "stage": "Oktober 2021", "id": 1826 }, { "stage": "September 2021", "id": 1783 }, { "stage": "August 2021", "id": 1764 }, { "stage": "Juli 2021", "id": 1726 }, { "stage": "Juni 2021", "id": 1703 }, { "stage": "Mai 2021", "id": 1679 }, { "stage": "April 2021", "id": 1669 }, { "stage": "März 2021", "id": 1646 }, { "stage": "Februar 2021", "id": 1624 }, { "stage": "Jahresgürtel 2020", "id": 1586 }, { "stage": "Januar 2021", "id": 1584 }, { "stage": "Dezember 2020", "id": 1517 }, { "stage": "November 2020", "id": 1481 }, { "stage": "Oktober 2020", "id": 1457 }, { "stage": "Dürfen Remakes in WHDG?", "id": 1431 }, { "stage": "November 2019", "id": 824 }, { "stage": "September 2020", "id": 1432 }, { "stage": "August 2020", "id": 1415 }, { "stage": "Juli 2020", "id": 1383 }, { "stage": "Wer hat den (wahren) Gürtel? Juni 2020", "id": 1344 }, { "stage": "Juni 2020", "id": 1345 }, { "stage": "Mai 2020", "id": 1319 }, { "stage": "April 2020", "id": 1233 }, { "stage": "März 2020", "id": 1172 }, { "stage": "April/Mai 2019", "id": 326 }, { "stage": "Februar 2020", "id": 1114 }, { "stage": "Jahresgürtel 2019", "id": 1066 }, { "stage": "Januar 2020", "id": 1045 }, { "stage": "Dezember 2019", "id": 979 }, { "stage": "Oktober 2019", "id": 706 }, { "stage": "September 2019", "id": 542 }, { "stage": "August 2019", "id": 525 }, { "stage": "Juli 2019", "id": 452 }, { "stage": "Juni 2019", "id": 375 }, { "stage": "März 2019", "id": 217 }, { "stage": "Februar 2019", "id": 146 }]},
    { "nr": "-", "name": "Superleague", "topics": [{ "stage": "Das Spielejahr 2009", "id": 1807 }, { "stage": "Das Spielejahr 2006", "id": 1738 }, { "stage": "Das Spielejahr 2001", "id": 1711 }, { "stage": "Das Spielejahr 2011", "id": 1687 }, { "stage": "Das Spielejahr 1998", "id": 1661 }]}
];

async function start(filename) {
    const outfile = path.join(outpath, filename);

    const f = fs.createWriteStream(outfile, {
        flags: "w",
        encoding: "utf8"
    });

    try {
        
        for(const staffel of staffeln) {
            console.log(staffel.name + "...");
            for(const topic of staffel.topics) {
                const data = await get("t/" + topic.id + ".json");
                const polls = [];
                // check the first few posts for polls...
                for(let i = 0; i < data.post_stream.posts.length && i < 3; i++) {
                    if(Array.isArray(data.post_stream.posts[i].polls) && data.post_stream.posts[i].polls.length > 0) {
                        for(let ii = 0; ii < data.post_stream.posts[i].polls.length; ii++) {
                            polls.push(data.post_stream.posts[i].polls[ii]);
                        }                        
                    }
                }
                if(polls.length === 0) {
                    console.error("didn't find polls for " + staffel.name + " : " + topic.id);
                    continue;
                }
                for(const poll of polls) {
                    if(!(Array.isArray(poll.options) && poll.options.length > 1)) {
                        console.error("invalid poll options for " + staffel.name + " : " + topic.id);
                        continue;
                    }
                    f.write(staffel.nr + "," + staffel.name + "," + topic.stage + "," + data.created_at + "," + data.last_posted_at + "," + data.posts_count + "," + data.views + "," + data.participant_count + "," + data.like_count + "," + data.word_count + "," + poll.voters);
                    for(const option of poll.options) {
                        f.write("," + getString(option.html) + "," + option.votes);
                    }
                    f.write("\n");
                }
            }
            console.log("sleeping for 10 seconds...");
            await sleep(10000);
        }
    } catch(exc) {
        console.error(exc);
    } finally {
        f.close();
    }
}

start("lgs.csv").then(() => {
    console.log("done");
}).catch(exc => {
    console.error(exc); 
})