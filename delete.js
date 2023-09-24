import fs from 'fs';
import csv from 'csv-parser';

let inputFilePath = '/users/akshay/downloads/universities1.csv';
const outputFilePath = '/users/akshay/downloads/output.csv';
let nToDelete = "1-36515461851" ;
let yToDelete="2019-20";

const rowsToDelete = [];
fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) => {
        if (row['AICTE ID'] !== nToDelete || row['Academic Year']!==yToDelete) {
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
            })
            console.log(`Row with ID ${nToDelete} ${yToDelete} deleted successfully and CSV file updated.`);
        });
    });
