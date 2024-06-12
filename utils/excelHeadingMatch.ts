import xlsx from 'xlsx';

type ExcelSheetWorkbook = {
  SheetNames: string[];
  Sheets: { [sheetName: string]: xlsx.WorkSheet };
};

type ExcelHeadingMatchResult = {
  headingsMatch: boolean;
  excelDataConvertIntoJsonData: any[]; // You might want to replace `any` with a more specific type if possible
  headers: string[];
  // unmatchedFields: string[];
};

export const excelHeadingMatch = (excelSheetWorkbook: ExcelSheetWorkbook, databaseFields: string[]): ExcelHeadingMatchResult => {
  let headingsMatch = true;
  const excelDataConvertIntoJsonData: any[] = [];
  const headers: string[] = [];
  // const unmatchedFields: string[] = [];

  excelSheetWorkbook.SheetNames.forEach((sheetName: string) => {
    const sheet = excelSheetWorkbook.Sheets[sheetName];

    if (sheet['!ref']) {
      const range = xlsx.utils.decode_range(sheet['!ref']);

      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: range.s.r }; // construct A1-style reference
        const cell_ref = xlsx.utils.encode_cell(cell_address);
        const cellValue: string | undefined = (sheet[cell_ref] as xlsx.CellObject)?.v as string | undefined;
        headers.push(cellValue || ''); // fetch the cell value and ensure it's a string
      }
    }

    headingsMatch = databaseFields.every((heading: any) => headers.includes(heading));

    // const missingFields = databaseFields.filter((field) => !headers.includes(field));
    // unmatchedFields.push(...missingFields);

    // console.log({ unmatchedFields });

    // headingsMatch = missingFields.length === 0;

    if (!headingsMatch) return;

    const sheetData: any[] = xlsx.utils.sheet_to_json(sheet);
    excelDataConvertIntoJsonData.push(...sheetData);
  });

  return { headingsMatch, excelDataConvertIntoJsonData, headers };
};
