import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import csv from 'csv-parser';
import mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;
dotenv.config();
const app = express();
app.set("view engine", "ejs");
const url = process.env.URI2;
const dbName = 'AICTE';
const collection = 'universities';
app.get("/",(req,res)=>{
  res.render("home");
})
app.post("/",(req,res)=> {
    console.log("0")
    MongoClient.connect(url, (err, client) => {
        if (err) {
            console.error("Error connecting to mongodb:", err);
            return;
        }
        console.log("1");
        const db = client.db(dbName);
        const universities = db.collection(collection);
        fs.createReadStream('universities.csv')
            .pipe(csv())
            .on('data', (row) => {
                const academicYear = row['Academic Year'];
                const universityName = row['Name'];
                collection.findOne({universityName: universityName}, (err, existingDocument) => {
                    if (err) {
                        console.error("Error finding document:", err);
                        return;
                    }
                    console.log("2");
                    if (existingDocument) {
                        collection.updateOne(
                            {_id: existingDocument._id},
                            {
                                $push: {
                                    history: {
                                        academic_year: academicYear,
                                    },
                                },
                            }, (err) => {
                                if (err) {
                                    console.error("Error updating document:", err);
                                }
                            })
                        console.log("2");
                    } else {
                        collection.insertOne({
                            universityName: universityName,
                            history: [
                                {
                                    academic_year: academicYear,
                                }]
                        }, (err) => {
                            if (err) {
                                console.error("Error inserting document:", err);
                            }
                        })
                    }
                    console.log("2");
                })
            }).on('end', () => {
            console.log('CSV file successfully processed');
            client.close();
        });
    }).then(() =>console.log("Successful") );
})
app.listen(3000, () => {
    console.log("Server is running on port 3000");
})