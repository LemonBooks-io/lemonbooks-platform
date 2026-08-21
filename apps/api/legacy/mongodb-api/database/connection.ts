import { Mongoose } from "mongoose";

class DbConnection {
    private mongooseInstance: Mongoose;

    constructor(mongooseInstance: Mongoose, private uri: string){
        this.mongooseInstance = mongooseInstance;
    }

    public async connectToDB(): Promise<void>{
        try {
            await this.mongooseInstance.connect(this.uri ?? "");
            console.log("*********Database connection successful!**********");
        } catch (error: any) {
             console.log("Failed to connect to Database: ", error);
             process.exit(1);
        }
    }
}

export default DbConnection;