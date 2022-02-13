import * as http from "http";
import * as express from "express";
import create_express from "express";
import create_session from "express-session";
import { join as joinPath } from "path";
import { MongoDB } from "./db";
import { StatsPage } from "./stats";
import { InputError } from "./exceptions";

const app = create_express();
app.use(express.static(joinPath(__dirname, "../www")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = new MongoDB();
const stats = new StatsPage(db);
const html_path = joinPath(__dirname, "../html/index.html");

app.use("/stats", stats.getRouter());

app.get("/", (req: express.Request, res: express.Response) => {
    res.type("html").sendFile(html_path);
});

app.get("/search", async(req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const term = req.query.search;
        const page = req.query.page;
        if(typeof term !== "string" || term.length === 0) {
            return [];
        }
        res.send(await db.search(term, Number(page)));
    } catch(exc) {
        next(exc);
    }
});

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if(res.headersSent) {
        return next(err);
    }
    if(err instanceof InputError) {
        res.status(400).send(err.message);
    } else {
        console.error(err);
        res.status(500).send("internal error");
    }
});

db.connect().then(() => {
    app.use(create_session({
        "store": db.getSessionStore(),
        "secret": "ajrgn35negkjndg",
        "resave": false,
        "saveUninitialized": false,
    }));
    const server = http.createServer(app);
    server.on('error', err => {
        console.error(err);
    });
    server.listen(8001, () => {
        const address = server.address();
        if(typeof address === "object" && address !== null) {
            console.log("server started. listening at port " + address.port);    
        } else {
            console.log("failed to get server address");
        }
    });
}).catch(exc => {
    console.error(exc);
})
