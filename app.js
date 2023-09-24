import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();
import fs from 'fs';
import csv from "csv-parser";

const uri = process.env.URI2;
const client = new MongoClient(uri);
let name,id,add,district,ins,women,minority,academicYear;
async function run() {
    try {
        const database = client.db("AICTE");
        const haiku = database.collection("universities");
        fs.createReadStream('/users/akshay/downloads/universities1.csv')
            .pipe(csv()).on('data', async(row) => {
             name = row['Name'];
             id = row['AICTE ID'];
             add = row['Address'];
             district = row['District'];
             ins = row['Institution Type'];
             women = row['Women'];
             minority = row['Minority'];
             academicYear = row['Academic Year'];
            console.log(academicYear);
        });
        const query = {"Academic Year": academicYear};
        const result = await haiku.findOne(query);
        if (result) {
            console.log(result);
            const res2 = await haiku.updateOne(
                {_id: result._id},
                {$push: {history: academicYear}},
                (err) => {
                    if (err) console.log("Error updating");
                }
            );
            console.log(res2);
        } else {
            console.log("Insertion initiated");
            const res3 = await haiku.insertOne({
                "Name": name,
                "AICTE ID": id,
                "Address": add,
                "District": district,
                "Institution Type": ins,
                "Women": women,
                "Minority": minority,
                "history": [academicYear]
            }, (err) => {
                if (err) console.log("Error inserting");
            })
        }
    } finally {
        await client.close();
    }
}
// Run the function and handle any errors
run().catch(console.dir);
