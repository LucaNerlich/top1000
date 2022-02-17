const axios = require("axios");
const fs = require("fs");
const path = require("path");

const outpath = path.join(__dirname, "../..", "data");

async function getJSON(offset) {
    const ret = await axios({
        "url": "https://api.mobygames.com/v1/games?format=normal&api_key=Xv3pGgk06BGX4vO7qlnnxQ==&offset=" + offset,
        "method": "get",
        "responseType": "json",
        "headers": { "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:65.0) Gecko/20100101 Firefox/65.0" }
    });
    if(ret.status === 200) {
        return ret.data;
    } else {
        throw new Error(ret.statusText);
    }
}

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

async function start(name) {
    const outfile = path.join(outpath, name + ".json");
    

    const f = fs.createWriteStream(outfile, {
        flags: "w",
        encoding: "utf8"
    });
    
    f.write("[ \n");

    let offset = 0;
    while(offset < 200000) {
        try {
            console.log("try with offset " + offset + "...");
            const data = await getJSON(offset);

            for(let i = 0; i < data.games.length; i++) {
                f.write(JSON.stringify(data.games[i]));
                if(i !== data.games.length - 1) {
                    f.write(",\n");
                }
            }

            if(data.games.length < 100) {
                break;
            }
            offset += 100;
        } catch(exc) {
            console.log(exc.message);
            console.log("try failed.");
        }
        console.log("sleeping for 10 seconds");
        await sleep(10000);
    }

    f.write("\n]");
    f.close();

    console.log("created " + outfile);
}

start("moby").then(() => {
    console.log("done");
}).catch(exc => {
    console.error(exc); 
})