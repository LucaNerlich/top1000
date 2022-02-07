const path = require("path");
const fs = require("fs");
const uglifycss = require("uglifycss");
const rollup = require("rollup");
const terser = require("rollup-plugin-terser");
const typescript = require("@rollup/plugin-typescript");
const sass = require("sass");

const rootPath = path.join(__dirname, "..");
const releasePath = path.join(rootPath, "built");
const frontendPath = path.join(rootPath, "frontend");
const backendPath = path.join(rootPath, "backend");

function processCSS(outpath) {
    const srcPath_css = path.join(frontendPath, "css");
    const srcFilenames_css = fs.readdirSync(srcPath_css, { withFileTypes: true });
    for(let i = 0; i < srcFilenames_css.length; i++) {
        if(srcFilenames_css[i].isFile()) {
            const extension = path.extname(srcFilenames_css[i].name);
            if(!(extension === ".scss" || extension === ".css")) {
                continue;
            }
            const srcFile = path.join(srcPath_css, srcFilenames_css[i].name);
            const tFilename = path.basename(srcFilenames_css[i].name, extension) + ".css";
            const tFile = path.join(outpath, tFilename);

            let uglified;
            if(extension === ".scss") {
                uglified = uglifycss.processString(sass.renderSync({file: srcFile}).css.toString());
            } else if(extension === ".css") {
                uglified = uglifycss.processFiles([srcFile]);
            }
            fs.writeFileSync(tFile, uglified);
            console.log("created \"" + tFile.toString() + "\"");
        }
    }
}

function processHTML(outpath) {
    let src_dir = path.join(frontendPath, "html");

    let temp = fs.readdirSync(src_dir, { "withFileTypes": true });
    for(let i = 0; i < temp.length; i++) {
        if(temp[i].isFile()) {
            fs.copyFileSync(path.join(src_dir, temp[i].name), path.join(outpath, temp[i].name))
        }
    }
    console.log("created \"" + outpath + "\"");
}

function processIcons(outpath) {
    let src_dir = path.join(frontendPath, "icons");

    let temp = fs.readdirSync(src_dir, { "withFileTypes": true });
    for(let i = 0; i < temp.length; i++) {
        if(temp[i].isFile()) {
            fs.copyFileSync(path.join(src_dir, temp[i].name), path.join(outpath, temp[i].name))
        }
    }
    console.log("created \"" + outpath + "\"");
}

async function processFrontendJS(outpath) {
    const tFile = path.join(outpath, "index.js");
    let bundle = await rollup.rollup({
        "input": path.join(frontendPath, "src/index.ts"),
        "plugins": [typescript({
            "tsconfig": path.join(frontendPath, "tsconfig.json"),
            "sourceMap": false,
            "mapRoot": undefined
        })]
    });
    await bundle.write({
        "file": tFile,
        "format": "iife",
        "plugins": [terser.terser({
            "format": {
                "comments": false
            }
        })],
        "sourcemap": false
    });
    console.log("created \"" + tFile + "\"");
}

async function processBackendJS(outpath) {
    const tFile = path.join(outpath, "index.js");
    let bundle = await rollup.rollup({
        "input": path.join(backendPath, "src/index.ts"),
        "plugins": [ typescript({
            "tsconfig": path.join(backendPath, "tsconfig.json"),
            "module": "esnext",
            "sourceMap": false
        })],
        "external": ["mongodb", "connect-mongo", "path", "fs", "fs/promises", "file-type", "image-size", "nanoid/non-secure", "http", "express", "express-session", "winston", "crypto", "file-type", "axios", "he", "cheerio"]
    });
    await bundle.write({
        "file": tFile,
        "format": "cjs",
        "plugins": [terser.terser({
            "format": {
                "comments": false
            }
        })],
        "sourcemap": false
    });
    console.log("created \"" + tFile + "\"");
}

try {
    fs.rmdirSync(releasePath, { recursive: true });
    console.log("deleted \"" + releasePath + "\"");

    fs.mkdirSync(releasePath, { recursive: true });
    let tPath_www = path.join(releasePath, "www");
    fs.mkdirSync(tPath_www);
    let tPath_src = path.join(releasePath, "src");
    fs.mkdirSync(tPath_src);
    let tPath_html = path.join(releasePath, "html");
    fs.mkdirSync(tPath_html);
    let tPath_css = path.join(tPath_www, "css");
    fs.mkdirSync(tPath_css);
    let tPath_js = path.join(tPath_www, "javascript");
    fs.mkdirSync(tPath_js);
    let tPath_icons = path.join(tPath_css, "icons");
    fs.mkdirSync(tPath_icons);

    processHTML(tPath_html);
    processCSS(tPath_css);
    processIcons(tPath_icons);
    processFrontendJS(tPath_js).then(() => {
        return processBackendJS(tPath_src);
    }).then(() => {
        console.log("done");
    }).catch(exc => {
        console.error(exc);
    });

} catch (err) {
    console.error("unexpected error.", err);
}