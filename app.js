import fs from 'fs';
import csv from 'csv-parser';
import mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;

const url = process.env.URI2;
const dbName = 'AICTE';
const collection = 'universities';
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error("Error connecting to mongodb:", err);
        return;
    }
    const db=client.db(dbName);
    const universities = db.collection(collection);
    fs.createReadStream('universities.csv')
        .pipe(csv())
        .on('data', (row) => {
            const academicYear = row['Academic Year'];
            const universityName = row['Name'];
            collection.findOne({ universityName: universityName }, (err, existingDocument) => {
                if (err) {
                    console.error("Error finding document:", err);
                    return;
                }
                if (existingDocument) {
                    collection.updateOne(
                        { _id: existingDocument._id },
                        {
                            $push: {
                                history: {
                                    academic_year: academicYear,
                                    intake: intake,
                                },
                            },
                        },(err)=> {
                            if (err) {
                                console.error("Error updating document:", err);
                            }
                        })
                }else {
                collection.insertOne({
                    universityName: universityName,
                    history: [
                        {
                            academic_year: academicYear,
                        }]},(err) =>{
                        if (err) {
                            console.error("Error inserting document:", err);
                        }
                    })
                }})
            }).on('end', () => {
                console.log('CSV file successfully processed');
                client.close();
            });
            });