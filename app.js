import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();
import fs from 'fs';
import csv from "csv-parser";

let shouldContinue = true;
const uri = process.env.URI2;
const client = new MongoClient(uri);
let name, id, add, district, ins, women, minority, academicYear;

async function *readCSV(filepath){
    const csvStream = fs.createReadStream(filepath).pipe(csv());
    for await (const row of csvStream) {
        yield row;
    }
}

async function run() {
    try {
        const database = client.db("AICTE");
        const haiku = database.collection("universities");
        let lastReadName = null;
        let lastReadId = null;
        let lastReadAcademicYear = null;

        while (shouldContinue) {
            let reachedEndOfFile = false;
            for await (const row of readCSV('/users/akshay/downloads/universities1.csv')) {
                name = row['Name'];
                id = row['AICTE ID'];
                add = row['Address'];
                district = row['District'];
                ins = row['Institution Type'];
                women = row['Women'];
                minority = row['Minority'];
                academicYear = row['Academic Year'];
                console.log(academicYear);
                lastReadName = name;
                lastReadId = id;
                lastReadAcademicYear = academicYear;

                const query = {"Name": name};
                const result = await haiku.findOne(query);
                if (result) {
                    const res2 = await haiku.updateOne(
                        {_id: result._id},
                        {$push: {history: academicYear}},
                        (err) => {
                            if (err) console.log("Error updating");
                        }
                    );
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
                    });
                }
            }
            reachedEndOfFile = true;
            if (reachedEndOfFile) {
                let inputFilePath = '/users/akshay/downloads/universities1.csv';
                const outputFilePath = '/users/akshay/downloads/output.csv';
                let nToDelete = lastReadId;
                let yToDelete = lastReadAcademicYear;

                const rowsToDelete = [];
                fs.createReadStream(inputFilePath)
                    .pipe(csv())
                    .on('data', (row) => {
                        if (row['AICTE ID'] !== nToDelete || row['Academic Year'] !== yToDelete) {
                            rowsToDelete.push(row);
                        }
                    })
                    .on('end', () => {
                        const writeStream = fs.createWriteStream(outputFilePath);
                        const headerRow = Object.keys(rowsToDelete[0]).map((key) => `"${key}"`).join(',');
                        writeStream.write(headerRow + '\n');

                        for (const row of rowsToDelete) {
                            const rowValues = Object.values(row).map((value) => `"${value}"`).join(',');
                            writeStream.write(rowValues + '\n');
                        }
                        writeStream.end(() => {
                            fs.rename(outputFilePath, inputFilePath, (err) => {
                                console.log(err);
                            });
                            console.log(`Row with ID ${nToDelete} ${yToDelete} deleted successfully and CSV file updated.`);
                        });
                    });
                shouldContinue = false;
            }
        }
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
