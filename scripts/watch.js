const path = require("path");
const chokidar = require("chokidar");
const { copyFileSync, unlinkSync, mkdirSync, readdirSync } = require("fs");

const folder = {
    "root": path.join(__dirname, ".."),
    "css": path.join(__dirname, "..", "frontend/css"),
    "icons": path.join(__dirname, "..", "frontend/icons"),
    "html": path.join(__dirname, "..", "frontend/html"),
    "debug_css": path.join(__dirname, "..", "debug/www/css"),
    "debug_html": path.join(__dirname, "..", "debug/html"),
    "debug_icons": path.join(__dirname, "..", "debug/www/css/icons")
};

mkdirSync(folder.debug_icons, { recursive: true });
mkdirSync(folder.debug_html, { recursive: true });

function getFileType(file) {
    let file_path = path.dirname(file);
    if(file_path.substring(file_path.length - 13).replace(/\\/, "/") === "frontend/html") {
        return "frontend_html";
    } else if(file_path.substring(file_path.length - 5).replace(/\\/, "/") === "icons") {
        return "frontend_icon";
    } else {
        return undefined;
    }
}

function onChangeFile(file) {
    try {
        let type = getFileType(file);
        if(type !== undefined) {
            let filename = path.basename(file);
            let out;
            switch(type) {
                case "frontend_html": {
                    out = path.join(folder.debug_html, filename);
                    break;
                }
                case "frontend_icon": {
                    out = path.join(folder.debug_icons, filename);
                    break;
                }
            }
            
            copyFileSync(file, out);
            console.log("copied \"" + filename + "\" to \"" + out + "\"");
        }
    } catch(exc) {
        console.error(exc.message);
    }
}

function onDeleteFile(file) {
    try {
        let type = getFileType(file);
        if(type !== undefined) {
            let filename = path.basename(file);
            let out;
            switch(type) {
                case "frontend_html": {
                    out = path.join(folder.debug_html, filename);
                    break;
                }
                case "frontend_html": {
                    out = path.join(folder.debug_icons, filename);
                    break;
                }
            }
            unlinkSync(out);
            console.log("deleted \"" + out + "\"");
        }
    } catch(exc) {
        console.error(exc.message);
    }
}

const watch_files = chokidar.watch([], {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    followSymlinks: false,
    ignoreInitial: false,
    depth: 0
});

watch_files.add(folder.html);
watch_files.add(folder.icons);
console.log("watching \"" + folder.html + "\"...");

watch_files.on("add", onChangeFile);
watch_files.on("change", onChangeFile);
watch_files.on("unlink", onDeleteFile);