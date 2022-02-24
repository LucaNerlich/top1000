import * as http from "http";
import * as express from "express";
import create_express from "express";
import create_session from "express-session";
import { join as joinPath } from "path";
import { MongoDB, VoterGroups, VoteGame } from "./db";
import { StatsPage } from "./stats";
import { InputError } from "./exceptions";

const app = create_express();
app.use(express.static(joinPath(__dirname, "../www")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = new MongoDB();
const router = express.Router();
const stats = new StatsPage(db);
const path_vote = joinPath(__dirname, "../html/vote.html");
const path_list = joinPath(__dirname, "../html/list.html");

declare module "express-session" {
    interface Session {
        user_id?: string,
        voted: boolean
    }
}

router.get("/", (req: express.Request, res: express.Response) => {
    if(req.session.voted === true) {
        res.type("html").sendFile(path_list);
    } else {
        res.type("html").sendFile(path_vote);
    }    
});

router.get("/list", (req: express.Request, res: express.Response) => {
    res.type("html").sendFile(path_list);
});

router.post("/", async(req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const gender = req.body.gender;
        if(typeof gender !== "string") {
            throw new Error("Missing gender");
        }        
        if(!(gender === "" || gender === "female" || gender === "male" || gender === "other")) {
            throw new Error("Invalid gender");
        }
        if(typeof req.body.age !== "string") {
            throw new Error("Missing age");
        }
        const age = parseInt(req.body.age);
        if(Number.isNaN(age) || age < 0 || age > 9) {
            throw new Error("Invalid age");
        }
        const groups: VoterGroups = {
            "gamer": (req.body.gamer === "gamer"),
            "journalist": (req.body.journalist === "journalist"),
            "scientist": (req.body.scientist === "scientist"),
            "critic": (req.body.critic === "critic"),
            "wasted": (req.body.wasted === "yes")
        };
        const games: VoteGame[] = [];
        for(let i = 1; i <= 30; i++) {
            const id = req.body["game" + i];
            const comment = req.body["game" + i + "_comment"];
            if(typeof id !== "string") {
                throw new Error("Missing game " + i);
            }
            if(id.length !== 24) {
                throw new Error("Invalid game: " + i);
            }
            if(typeof comment !== "string") {
                throw new Error("Missing comment " + i);
            }
            games.push({
                "id": id,
                "position": i,
                "comment": comment
            });
        }

        await db.insertVote(gender, age, groups, games);
        req.session.voted = true;
        res.type("html").sendFile(path_list);
    } catch(exc) {
        next(exc);
    }
});

router.get("/api/list", async(req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        if(typeof req.query.page !== "string") {
            throw new Error("Missing page");
        }
        let gender: string | undefined = undefined;
        if(typeof req.query.gender === "string") {
            gender = req.query.gender;
            if(!(gender === "female" || gender === "male" || gender === "other")) {
                throw new Error("Invalid gender");
            }
        }
        let age: number | undefined = undefined;
        if(typeof req.query.age === "string") {
            age = parseInt(req.query.age);
            if(Number.isNaN(age) || age < 1 || age > 9) {
                throw new Error("Invalid age");
            }
        }
        let group: string | undefined = undefined;
        if(typeof req.query.group === "string") {
            group = req.query.group;
            if(!(group === "gamer" || group === "journalist" || group === "scientist" || group === "critic" || group === "wasted")) {
                throw new Error("Invalid group");
            }
        }
        res.send(await db.getList(parseInt(req.query.page), gender, age, group));
    } catch(exc) {
        next(exc);
    }
});

router.get("/api/search", async(req: express.Request, res: express.Response, next: express.NextFunction) => {
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

router.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
        "cookie": {
            "maxAge": 1000 * 60 * 60 * 24
        }
    }));
    app.use("/", router);
    app.use("/stats", stats.getRouter());
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
