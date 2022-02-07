import MongoStore from "connect-mongo";
import { Store as SessionStore } from "express-session";
import { MongoClient, ReadPreference, Collection, MongoClientOptions } from "mongodb";

const regex_escape = /[.*+?^${}()|[\]\\]/g;

export class MongoDB
{
    private client: MongoClient | undefined;
    private games: Collection | undefined;

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