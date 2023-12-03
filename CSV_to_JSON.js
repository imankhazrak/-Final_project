const fs = require('fs');
const parse = require('csv-parse/lib/sync');

function csvToJson(csvFilePath, jsonFilePath) {
    const csvData = fs.readFileSync(csvFilePath);
    const records = parse(csvData, { columns: true });
    fs.writeFileSync(jsonFilePath, JSON.stringify(records, null, 2));
}

// Example usage
csvToJson('C:\0_Git_Iman\Term_project.github.io\soil_clean_grouped.csv', 
            'C:\0_Git_Iman\Term_project.github.io\soil_clean_grouped.json');
