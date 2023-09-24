import fs from 'fs';
import csv from 'csv-parser';

let inputFilePath = '/users/akshay/downloads/universities1.csv'; // Replace with your CSV file path
const outputFilePath = '/users/akshay/downloads/output.csv'; // Replace with your desired output file path
let nToDelete = "1-36515461851" ; // Replace with the ID you want to delete
let yToDelete="2019-20";

const rowsToDelete = [];

// Read the CSV file and collect rows to delete
fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) => {
        if (row['AICTE ID'] !== nToDelete || row['Academic Year']!==yToDelete) {
            rowsToDelete.push(row);
        }
    })
    .on('end', () => {
        // Write the remaining rows to the output file
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
