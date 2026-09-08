import JsonImport from "@/components/admin/JsonImport";

const schema = `[
  {
    "title": "string (required)",
    "content": "string (required)",
    "grade": "string (e.g., Grade 12)",
    "subject": "string (e.g., History)",
    "unit": "string (e.g., World War II)"
  }
]`;

const example = `[
  {
    "title": "World War II Overview",
    "content": "World War II was a global war that lasted from 1939 to 1945...",
    "grade": "Grade 12",
    "subject": "History",
    "unit": "World War II"
  }
]`;

export default function ImportNotes() {
  return (
    <JsonImport
      title="Import Notes"
      endpoint="/api/admin/import/notes"
      schema={schema}
      example={example}
      entityName="note"
    />
  );
}
