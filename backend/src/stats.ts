import * as express from "express";
import { join as joinPath } from "path";
import { MongoDB, PollData } from "./db";
import { InputError } from "./exceptions";

type JQBracketData = {
    teams: string[][],
    results: unknown[][]
};

export class StatsPage {
    private db: MongoDB;
    private router: express.Router;
    private html_path: string;
    private static colorlist = ["#696969", "#556b2f", "#a0522d", "#228b22", "#483d8b", "#b8860b", "#008b8b", "#4682b4", "#00008b", "#32cd32", "#8fbc8f", "#8b008b", "#b03060", "#ff0000", "#ff8c00", "#00ff00", "#8a2be2", "#dc143c", "#00ffff", "#0000ff", "#adff2f", "#ff00ff", "#1e90ff", "#f0e68c", "#ffff54", "#b0e0e6", "#ff1493", "#7b68ee", "#ffa07a", "#ee82ee", "#98fb98", "#ffc0cb"];

    constructor(db: MongoDB) {
        this.db = db;
        this.router = express.Router();
        this.html_path = joinPath(__dirname, "../html/stats.html");

        this.router.get("/", this.routeBase.bind(this));
        this.router.get("/api", this.routeAPI.bind(this));
    }

    public getRouter() {
        return this.router;
    }

    private routeBase(req: express.Request, res: express.Response) {
        res.type("html").sendFile(this.html_path);
    }

    private async routeAPI(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if(typeof req.query.type !== "string" || typeof req.query.id !== "string") {
                throw new InputError("Invalid parameters");
            }
            let ret;
            switch(req.query.type) {
                case "bracket": {
                    ret = await this.getBracket(req.query.id);
                    break;
                }
                case "chart": {
                    ret = await this.getChart(req.query.id);
                    break;
                }
                case "pie": {
                    ret = await this.getPie(req.query.id);
                    break;
                }
                case "list": {
                    ret = await this.db.getPollList(req.query.id);
                    break;
                }
                default: {
                    throw new InputError("Invalid type");
                }
            }
            res.type("text/json").send(ret);
        } catch(exc) {
            next(exc);
        }
    }

    private async getBracket(id: string) {
        const _id = Number.parseInt(id);
        if(Number.isNaN(_id)) {
            throw new InputError("Invalid id");
        }
        const data = await this.db.getStaffelData(_id);
        if(data.length === 0) {
            throw new InputError("Staffel not found");
        }

        const date_first = data[0].created_at;
        const date_last = data[data.length - 1].created_at;
        const s_von = date_first.getDate() + "." + (date_first.getMonth() + 1) + "." + date_first.getFullYear();
        const s_bis = date_last.getDate() + "." + (date_last.getMonth() + 1) + "." + date_last.getFullYear();
        
        const ret: { label: string, time: string, data: JQBracketData } = {
            "label": data[0].thema,
            "time": s_von + " bis " + s_bis,
            "data": {
                "teams": [],
                "results": []
            }
        };

        const rounds_data: PollData[][] = [
            [], [], [], []
        ]
        const rounds_sorted: PollData[][] = [];
        const rlength: number[] = [
            1, 2, 4, 8
        ];
        // Sort data by stage
        for(let i = 0; i < data.length; i++) {
            switch(data[i].stage) {
                case "Finale":
                    rounds_data[0].push(data[i]);
                    break;
                case "Halbfinale":
                    rounds_data[1].push(data[i]);
                    break;
                case "Viertelfinale":
                    rounds_data[2].push(data[i]);
                    break;
                case "Achtelfinale":
                    rounds_data[3].push(data[i]);
                    break;
            }
        }
        // Check if there is enough data for bracket
        for(let i = 0; i < rounds_data.length; i++) {
            if(rounds_data[i].length !== rlength[i]) {
                if(i === 0 || i === 1) {
                    throw new Error("Not enough data for bracket");
                } else {
                    rounds_data.splice(i);
                    break;
                }
            }
        }
        // Sort data to create valid bracket tree
        for(let i = 0; i < rounds_data.length; i++) {
            if(i === 0) {
                rounds_data[0][0].winner = null;
                rounds_sorted.push([rounds_data[0][0]]);
            } else {
                const temp: PollData[] = [];
                for(let x = 0; x < rlength[i - 1]; x++) {
                    for(let oi = 0; oi < 2; oi++) {
                        const winner = rounds_sorted[0][x].options[oi].name;
                        for(let ii = 0; ii < rounds_data[i].length; ii++) {                                                    
                            if(rounds_data[i][ii].options[0].name === winner || rounds_data[i][ii].options[1].name === winner) {
                                if(rounds_data[i][ii].options[0].votes === rounds_data[i][ii].options[1].votes) {
                                    rounds_data[i][ii].winner = (rounds_data[i][ii].options[0].name === winner) ? 1 : 0;
                                } else {
                                    rounds_data[i][ii].winner = null;
                                }
                                temp.push(rounds_data[i][ii]);
                                break;
                            }
                        }
                    }
                }
                rounds_sorted.unshift(temp);
            }
        }

        // create data object for teijo/jquery-bracket
        for(let i = 0; i < rounds_sorted.length; i++) {
            const temp_res: unknown[][] = [];
            let v1, v2;
            for(let ii = 0; ii < rounds_sorted[i].length; ii++) {
                if(i === 0) {
                    ret.data.teams.push([rounds_sorted[0][ii].options[0].name, rounds_sorted[0][ii].options[1].name]);
                    v1 = rounds_sorted[0][ii].options[0].votes;
                    v2 = rounds_sorted[0][ii].options[1].votes;
                } else {
                    const w_i1 = rounds_sorted[i - 1][ii * 2];
                    if(w_i1.options[0].name !== rounds_sorted[i][ii].options[0].name && w_i1.options[1].name !== rounds_sorted[i][ii].options[0].name) {
                        v1 = rounds_sorted[i][ii].options[1].votes;
                        v2 = rounds_sorted[i][ii].options[0].votes;
                    } else {
                        v1 = rounds_sorted[i][ii].options[0].votes;
                        v2 = rounds_sorted[i][ii].options[1].votes;
                    }
                }
                temp_res.push([v1,v2,rounds_sorted[i][ii].winner]);
            }
            ret.data.results.push(temp_res);
        }

        return ret;
    }

    private async getPie(id: string) {
        const data = await this.db.getPollData(id);
        const labels: string[] = [];
        const votes: number[] = [];
        const colors: string[] = [];

        for(let i = 0; i < data.options.length; i++) {
            labels.push(data.options[i].name);
            votes.push(data.options[i].votes);
            colors.push(StatsPage.colorlist[i]);
        }
        
        return {
            "title": data.stage,
            "date": "" + data.created_at.getDate() + "." + (data.created_at.getMonth() + 1) + '.' +  data.created_at.getFullYear(),
            "data": {
                labels: labels,
                datasets: [{
                    label: "",
                    data: votes,
                    backgroundColor: colors,
                    hoverOffset: 4
                }]
            }
        };
    }

    private async getChart(id: string) {
        let data: any[];
        const ret: { [key: string]: any } = {
            "data": {
                "labels": [],
                "datasets": []
            },
            "labels": []
        };
        switch(id) {
            case "lgs1": {
                data = await this.db.getLGSActivity();
                ret.data.datasets.push({
                    "label": "Stimmen gesamt",
                    "borderColor": "rgb(255, 99, 132)",
                    "data": []
                });
                ret.data.datasets.push(                {
                    "label": "Unterschiedliche Autoren",
                    "borderColor": "rgb(0, 255, 0)",
                    "data": []
                });
                for(let i = 0; i < data.length; i++) {
                    ret.data.datasets[0].data.push(data[i].voters);
                    ret.data.datasets[1].data.push(data[i].participant_count);
                }
                break;
            }
            case "lgs2": {
                data = await this.db.getLGSActivity();
                ret.data.datasets.push({
                    "label": "Anzahl der posts",
                    "borderColor": "rgb(255, 99, 132)",
                    "data": []
                });
                ret.data.datasets.push({
                    "label": "Likes gesamt",
                    "borderColor": "rgb(0, 255, 0)",
                    "data": []
                });
                for(let i = 0; i < data.length; i++) {
                    ret.data.datasets[0].data.push(data[i].posts_count);
                    ret.data.datasets[1].data.push(data[i].like_count);
                }
                break;
            }
            default: {
                throw new InputError("Invalid id");
            }
        }

        for(let i = 0; i < data.length; i++) {
            const year = data[i].created_at.getFullYear();
            const month = data[i].created_at.getMonth() + 1;
            const day = data[i].created_at.getDate();
            const date = day + "." + month + "." + year;
            ret.labels.push([data[i].thema + ": " + data[i].stage, data[i].options[0].name + " (" + data[i].options[0].votes + ") vs " + data[i].options[1].name + " (" + data[i].options[1].votes + ")"]);
            ret.data.labels.push(date);
        }
        return ret;
    }
}