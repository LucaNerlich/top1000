const path = require("path");
const chokidar = require("chokidar");
const { copyFileSync, unlinkSync, mkdirSync, readdirSync } = require("fs");
const rollup = require('rollup');
const typescript = require("@rollup/plugin-typescript");
const { nodeResolve } = require("@rollup/plugin-node-resolve");

const folder = {
    "root": path.join(__dirname, ".."),
    "frontend": path.join(__dirname, "..", "frontend"),
    "css": path.join(__dirname, "..", "frontend/css"),
    "icons": path.join(__dirname, "..", "frontend/icons"),
    "html": path.join(__dirname, "..", "frontend/html"),
    "jslib": path.join(__dirname, "..", "frontend/src/lib"),
    "debug_css": path.join(__dirname, "..", "debug/www/css"),
    "debug_html": path.join(__dirname, "..", "debug/html"),
    "debug_icons": path.join(__dirname, "..", "debug/www/css/icons"),
    "debug_js": path.join(__dirname, "..", "debug/www/javascript"),
    "debug_jslib": path.join(__dirname, "..", "debug/www/javascript/lib")
};

mkdirSync(folder.debug_icons, { recursive: true });
mkdirSync(folder.debug_html, { recursive: true });
mkdirSync(folder.debug_jslib, { recursive: true });

function getFileType(file) {
    let file_path = path.dirname(file);
    if(file_path.substring(file_path.length - 16).replace(/\\/g, "/") === "frontend/src/lib") {
        return "frontend_lib";
    } else if(file_path.substring(file_path.length - 13).replace(/\\/g, "/") === "frontend/html") {
        return "frontend_html";
    } else if(file_path.substring(file_path.length - 5).replace(/\\/g, "/") === "icons") {
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
                case "frontend_lib": {
                    out = path.join(folder.debug_jslib, filename);
                    break;
                }
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
        } else {
            console.log("unknown filetype: " + file);
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
                case "frontend_lib": {
                    out = path.join(folder.debug_jslib, filename);
                    break;
                }
                case "frontend_html": {
                    out = path.join(folder.debug_html, filename);
                    break;
                }
                case "frontend_icon": {
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
console.log("watching \"" + folder.html + "\"...");
watch_files.add(folder.icons);
console.log("watching \"" + folder.icons + "\"...");
watch_files.add(folder.jslib);
console.log("watching \"" + folder.jslib + "\"...");

watch_files.on("add", onChangeFile);
watch_files.on("change", onChangeFile);
watch_files.on("unlink", onDeleteFile);

// frontend/stats
const stats_out_file = path.join(folder.debug_js, "stats.js");
const stats_in_file = path.join(folder.frontend, "src/stats.ts");
const stats_watcher = rollup.watch({
    "input": stats_in_file,
    "plugins": [typescript({
        "tsconfig": path.join(folder.frontend, "tsconfig.json"),
        "sourceMap": false
    }),nodeResolve({
        "browser": true
    })],
    "output": {
        "file": stats_out_file,
        "format": "iife",
        "sourcemap": true
    }
});
console.log("watching " + stats_in_file);