import mongoose from "mongoose";


export async function connectDB(){

    try {
        await mongoose.connect(process.env.DATABASE_URL,{
            dbName:'store'
        })
        console.log('connection created successfully.');
    } catch (error) {
        console.log(error)
    }
}
