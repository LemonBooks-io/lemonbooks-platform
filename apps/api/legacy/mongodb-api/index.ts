import "dotenv/config";
import config from "config";
import App from "./app";
import DbConnection from "./database/connection";
import mongoose from "mongoose";
import seedRootAccount from "./database/seeders/root-account.seed";
// import {setUpRedisClient} from "./redis/redis"


const port = config.get("PORT") ?? 5000;

const app = new App();

const startApp = async (app: App, port: number) => {
  await new DbConnection(mongoose, config.get("DB_URI") ?? "").connectToDB();

  // seed root accounts
  // Includes @admin, @business, @tenant
  await seedRootAccount()
  // // set up redis client
  // await setUpRedisClient()
  //
  await app.start(port);

};

startApp(app, port as number);
