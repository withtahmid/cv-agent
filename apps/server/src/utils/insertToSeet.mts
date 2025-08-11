import { google } from "googleapis";
import { ExtractedData } from "./extractDataAndFormat.mjs";

function getGoogleSheetsClient(SHEET_CONFIG: any) {
    try {
        const credentials = JSON.parse(JSON.parse(SHEET_CONFIG));
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        return google.sheets({ version: "v4", auth });
    } catch (err) {
        console.error("Error initializing Google Sheets client:", err);
        return null;
    }
}

export async function insertToGoogleSheets({
    extracted,
    SHEET_CONFIG,
    SHEET_ID,
    SHEET_NAME,
}: {
    extracted: ExtractedData;
    SHEET_CONFIG: any;
    SHEET_ID: string;
    SHEET_NAME: string;
}) {
    const sheets = getGoogleSheetsClient(SHEET_CONFIG);
    if (!sheets) {
        return { error: "Failed to connect to Google Sheets" };
    }

    const spreadsheetId = SHEET_ID;
    const worksheetName = SHEET_NAME;

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = spreadsheet.data.sheets?.some(
        (s) => s.properties?.title === worksheetName
    );

    if (!sheetExists) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: worksheetName,
                                gridProperties: {
                                    rowCount: 1000,
                                    columnCount: 20,
                                },
                            },
                        },
                    },
                ],
            },
        });

        const headers = [
            "Name",
            "Gender",
            "Date of Birth",
            "NID Number",
            "Phone",
            "Education",
            "Fathers Name",
            "Mothers Name",
            "Present Address",
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${worksheetName}!A1`,
            valueInputOption: "RAW",
            requestBody: { values: [headers] },
        });
    }

    const rowData = [
        extracted.name || "",
        extracted.gender || "",
        extracted.date_of_birth || "",
        extracted.nid_number || "",
        extracted.phone,
        extracted.education || "",
        extracted.fathers_name || "",
        extracted.mothers_name || "",
        extracted.present_address || "",
    ];

    const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${worksheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [rowData] },
    });

    const updates = res.data.updates;
    const success =
        updates?.updatedRows === 1 &&
        updates?.updatedCells &&
        updates?.updatedCells > 0;
    if (!success) {
        throw new Error("Failed to insert data into Google Sheets");
    }
}
