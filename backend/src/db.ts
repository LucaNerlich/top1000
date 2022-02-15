import MongoStore from "connect-mongo";
import { Store as SessionStore } from "express-session";
import { MongoClient, ReadPreference, Collection, MongoClientOptions, ObjectId } from "mongodb";
import { InputError } from "./exceptions";

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
    title: string
};

const regex_escape = /[.*+?^${}()|[\]\\]/g;

export class MongoDB
{
    private client: MongoClient | undefined;
    private games: Collection | undefined;
    private polls: Collection | undefined;

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
                "title": "$stage"
            }
        }).toArray();
        if(data.length === 0) {
            throw new InputError("Nothing found.");
        }
        const ret = data as unknown;
        return ret as PollListItem[];
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
                "name": new RegExp(input.replace(regex_escape, "\\$&"),"gi")
            } },
            { "$sort": { "name": 1 } },
            { "$facet": {
                "metadata": [ { "$count": "total" } ],
                "data": [
                    { "$skip": offset },
                    { "$limit": 10 },
                    { "$project": {
                        "_id": 0,
                        "id": { "$toString": "$_id" },
                        "text": "$name"
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