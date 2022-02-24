import MongoStore from "connect-mongo";
import { Store as SessionStore } from "express-session";
import { MongoClient, ReadPreference, Collection, MongoClientOptions, ObjectId, Document } from "mongodb";
import { InputError } from "./exceptions";

export type VoterGroups = {
    gamer?: boolean,
    journalist?: boolean,
    scientist?: boolean,
    critic?: boolean,
    wasted?: boolean
};

export type VoteGame = {
    id: string,
    position: number,
    comment: string
};

export type PollOption = {
	name: string,
	votes: number
};

export type PollData = {
	_id: ObjectId,
	season: number,
	topic: string,
	stage: string,
	created_at: Date,
	last_posted_at: Date,
	posts_count: number,
	views: number,
	participant_count: number,
	like_count: number,
	word_count: number,
	voters: number,
	options: PollOption[],
    winner?: number | null
};

export type PollListItem = {
    id: ObjectId,
    title: string,
    date: Date
};

const regex_escape = /[.*+?^${}()|[\]\\]/g;

export class MongoDB
{
    private client: MongoClient | undefined;
    private games: Collection | undefined;
    private polls: Collection | undefined;
    private votes: Collection | undefined;

    public async connect(): Promise<void> {
        const url = process.env.MDB_TOP1000;
        if(url === undefined) {
            throw new Error("Missing env.MDB_TOP1000");
        }
        try {
            this.client = await MongoClient.connect(url, {
                "useUnifiedTopology": true,
                "appname": "Top1000",
                "readPreference": ReadPreference.PRIMARY_PREFERRED,
                "connectTimeoutMS": 2000
            } as MongoClientOptions);
            const db = this.client.db("top1000");
            await db.command({ ping: 1 });
            this.games = db.collection("games");
            this.polls = db.collection("polls");
            this.votes = db.collection("votes");
            console.log("Connected to mongodb server");
        } catch(err) {
            await this.close();
            throw err;
        }
    }

    public async close(): Promise<void> {
        if(this.client !== undefined) {
            await this.client.close();
            this.client = undefined;
        }
    }

    public getSessionStore(): SessionStore {
        if(this.client === undefined) {
            throw new Error("No database connection");
        } else {
            return MongoStore.create({
                "client": this.client,
                "dbName": "top1000",
                "crypto": {
                    "secret": "ahj4hj56judghja1m"
                }
            });
        }
    }

    public async insertVote(gender: string, age: number, groups: VoterGroups, games: VoteGame[]) {
        if(this.votes === undefined) {
            throw new Error("No database connection");
        }
        const query: Document[] = [];
        for(let i = 0; i < games.length; i++) {
            const vote: Document = {
                "groups": groups,
                "game": ObjectId.createFromHexString(games[i].id),
                "position": games[i].position
            };
            if(gender === "female" || gender === "male" || gender === "other") {
                vote.gender = gender;
            }
            if(Number.isInteger(age) && age > 0 && age < 10) {
                vote.age = age;
            }
            if(games[i].comment.length > 0 && games[i].comment.length <= 4096) {
                vote.comment = games[i].comment;
            }
            query.push(vote);
        }
        const ret = await this.votes.insertMany(query);
        if(ret.acknowledged === false || ret.insertedCount !== games.length) {
            throw new Error("Failed to insert vote");
        }
    }

    public async getList(page: number, gender?: "female" | "male" | "other", age?: number, group?: "gamer" | "journalist" | "critic" | "scientist" | "wasted") {
        if(this.votes === undefined) {
            throw new Error("No database connection");
        }
        if(!(Number.isInteger(page) && page > 0)) {
            throw new Error("Invalid page");
        }
        const query: Document = {};
        if(gender !== undefined) {
            query.gender = gender;
        }
        if(age !== undefined) {
            query.age = age;
        }
        if(group !== undefined) {
            query["groups." + group] = true;
        }
        const ret = await this.votes.aggregate([
            { "$match": query },
            { "$group": {
                "_id": "$game",
                "rank": { "$sum": { "$subtract": [10.3103448275862, { "$multiply": [0.3103448275862, "$position"]}] } },
                "comments": { "$push": "$comment" },
                "votes" : { "$sum": 1 }
            } },
            { "$facet": {
                "meta": [ { "$count": "total" } ],
                "data": [
                    { "$sort": {
                        "rank": -1
                    }},
                    { "$skip": (page - 1) * 10 },
                    { "$limit": 10 },
                    { "$lookup": {
                        "from": "games",
                        "localField": "_id",
                        "foreignField": "_id",
                        "as": "game"
                    } },
                    { "$project": {
                        "rank": "$rank",
                        "votes": "$votes",
                        "game": { "$arrayElemAt": [ "$game", 0 ] },
                        "comments": "$comments"
                    } }
                ]
            } }
        ]).next();

        if(ret === null) {
            throw new Error("Failed to get list");
        }

        const count = (Array.isArray(ret.meta) && ret.meta.length === 1 && typeof ret.meta[0].total === "number") ? ret.meta[0].total : 0;

        return {
            "data": ret.data,
            "pages": Math.ceil(count / 10),
            "limit": 10
        };
    }

    public async getPollData(id: string): Promise<PollData> {
        if(this.polls === undefined) {
            throw new Error("No database connection");
        }
        if(id.length !== 24) {
            throw new InputError("Invalid id");
        }
        const data = await this.polls.findOne({
            "_id": ObjectId.createFromHexString(id)
        });
        if(data === null) {
            throw new InputError("Not found");
        }
        return data as PollData;
    }

    public async getLGSActivity(): Promise<PollData[]> {
        if(this.polls === undefined) {
            throw new Error("No database connection");
        }
        return await this.polls.find({ "$or": [ { "stage": "Viertelfinale" } , { "stage": "Halbfinale"}, { "stage": "Finale"}, {"stage": "Achtelfinale"}]}, {"sort": { "created_at": 1}}).toArray() as PollData[];
    }

    public async getSeasonData(id: number): Promise<PollData[]> {
        if(this.polls === undefined) {
            throw new Error("No database connection");
        }
        const data = await this.polls.find({"season": id, "$or": [ { "stage": "Viertelfinale" } , { "stage": "Halbfinale"}, { "stage": "Finale"}, {"stage": "Achtelfinale"}]}, {"sort": { "created_at": 1}}).toArray();
        if(data.length === 0) {
            throw new InputError("Season not found");
        }
        return data as PollData[];
    }

    public async getPollList(id: string): Promise<PollListItem[]> {
        if(this.polls === undefined) {
            throw new Error("No database connection");
        }
        let topic;
        switch(id) {
            case "bonus": {
                topic = "Bonusfolgen";
                break;
            }
            case "belt": {
                topic = "Wer hat den Gürtel";
                break;
            }
            case "top5": {
                topic = "Superleague/Top5";
                break;
            }
            default: {
                throw new InputError("Invalid id");
            }
        }
        const data = await this.polls.find({
            "topic": topic
        }, {
            "sort": {
                "created_at": 1
            },
            "projection": {
                "_id": 0,
                "id": "$_id",
                "title": "$stage",
                "date": "$created_at"
            }
        }).toArray();
        if(data.length === 0) {
            throw new InputError("Nothing found.");
        }
        const ret = data as unknown;
        return ret as PollListItem[];
    }

    public async getBeltHolders() {
        if(this.polls === undefined) {
            throw new Error("No database connection");
        }
        const data = await this.polls.find({
            "topic": "Wer hat den Gürtel",
            "category": 0
        }, {
            "sort": {
                "created_at": 1
            }
        }).toArray();
        return data;
    }

    public async search(input: string, page?: number) {
        if(this.games === undefined) {
            throw new Error("No database connection");
        }
        let offset = 0;
        if(page !== undefined && Number.isInteger(page) && page > 0 && page < 1000) {
            offset = (page - 1) * 10;
        }

        const res = await this.games.aggregate([
            { "$match": {
                "title": new RegExp(input.replace(regex_escape, "\\$&"),"gi")
            } },
            { "$sort": { "title": 1 } },
            { "$facet": {
                "metadata": [ { "$count": "total" } ],
                "data": [
                    { "$skip": offset },
                    { "$limit": 10 },
                    { "$project": {
                        "_id": 0,
                        "id": { "$toString": "$_id" },
                        "text": "$title",
                        "image": "$sample_cover.thumbnail_image",
                        "platforms": "$platforms"
                    } }
                ]
            } }
        ]).next();

        if(res !== null && res.data.length > 0) {
            return {
                "results": res.data,
                "pagination": {
                    "more": res.metadata[0].total > offset + 10
                }
            }
        } else {
            return {
                "results": [],
                "pagination": {
                    "more": false
                }
            }
        }
    }
}