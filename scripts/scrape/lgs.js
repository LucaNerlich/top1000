const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { decode } = require("html-entities");
const staffeln = require("./lgs_info.js");

const outpath = path.join(__dirname, "../..", "data");

async function get(what, wasted) {
    const ret = await axios({
        "url": (wasted === true) ? "https://community.wasted.de/" + what : "https://forum.lastgamestanding.de/" + what,
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

async function start(name) {
    const outfile_csv = path.join(outpath, name + ".csv");
    const outfile_json = path.join(outpath, name + ".json");
    const out_json = [];

    const f = fs.createWriteStream(outfile_csv, {
        flags: "w",
        encoding: "utf8"
    });

    try {
        f.write("Staffel,Thema,Begegnung,Erstellt am,Letzter post am,Posts,Views,Unterschiedliche Autoren,Likes,Wörter,Wähler gesamt\n\n");

        for(const staffel of staffeln) {
            console.log(staffel.name + "...");
            for(const topic of staffel.topics) {
                const data = await get("t/" + topic.id + ".json", topic.wasted);
                const polls = [];
                // check the first few posts for polls by schiff, alt, sofakissen
                for(let i = 0; i < data.post_stream.posts.length && i < 10; i++) {
                    const post = data.post_stream.posts[i];
                    if(i === 0 || post.username === "system" || post.username === "christian.alt" || post.username === "altf4" || post.username === "christianschiffer" || post.username === "Christian.Schiffer" || post.username === "sofakissen") {
                        if(Array.isArray(data.post_stream.posts[i].polls) && data.post_stream.posts[i].polls.length > 0) {
                            for(let ii = 0; ii < data.post_stream.posts[i].polls.length; ii++) {
                                polls.push(data.post_stream.posts[i].polls[ii]);
                            }
                        }
                    }
                }
                if(polls.length === 0) {
                    console.error("didn't find polls for " + staffel.name + " : " + topic.id);
                    continue;
                }
                const poll = (topic.poll_index === undefined) ? polls[0] : polls[topic.poll_index];

                if(!(Array.isArray(poll.options) && poll.options.length > 1)) {
                    console.error("invalid poll options for " + staffel.name + " : " + topic.id);
                    continue;
                }
                const out = {
                    "staffel": staffel.nr,
                    "thema": getString(staffel.name),
                    "stage": getString(topic.stage),
                    "created_at": { "$date": data.created_at },
                    "last_posted_at": { "$date": data.last_posted_at },
                    "posts_count": data.posts_count,
                    "views": data.views,
                    "participant_count": data.participant_count,
                    "like_count": data.like_count,
                    "word_count": data.word_count,
                    "voters": poll.voters,
                    "options": []
                };
                if(topic.id === 25) {
                    const lol = true;
                }

                f.write(out.staffel + "," + out.thema + "," + out.stage + "," + out.created_at.$date + "," + out.last_posted_at.$date + "," + out.posts_count + "," + out.views + "," + out.participant_count + "," + out.like_count + "," + out.word_count + "," + out.voters);
                if(topic.option1 !== undefined && topic.option2 !== undefined) {
                    if(poll.options.length !== 2) {
                        console.error("invalid poll options for " + staffel.name + " : " + topic.id);
                        continue;
                    }
                    const opt1 = {
                        "name": getString(topic.option1),
                        "votes": poll.options[0].votes
                    };
                    const opt2 = {
                        "name": getString(topic.option2),
                        "votes": poll.options[1].votes
                    };
                    f.write("," + opt1.name + "," + opt1.votes + "," + opt2.name + "," + opt2.votes);
                    out.options.push(opt1);
                    out.options.push(opt2);
                } else {
                    for(const option of poll.options) {
                        const out_opt = {
                            "name": getString(option.html),
                            "votes": option.votes
                        };
                        f.write("," + out_opt.name + "," + out_opt.votes);
                        out.options.push(out_opt);
                    }
                }

                f.write("\n");
                out_json.push(out);

            }
            console.log("sleeping for 5 seconds...");
            await sleep(5000);
        }
        console.log("created " + outfile_csv);
    } catch(exc) {
        console.error(exc);
    } finally {
        f.close();
    }

    fs.writeFileSync(outfile_json, JSON.stringify(out_json));
    console.log("created " + outfile_json);
}

start("lgstest").then(() => {
    console.log("done");
}).catch(exc => {
    console.error(exc); 
})