import JsonImport from "@/components/admin/JsonImport";

const schema = `[
  {
    "front": "string (required)",
    "back": "string (required)",
    "grade": "string (e.g., Grade 12)",
    "subject": "string (e.g., Biology)",
    "unit": "string (e.g., Cell Structure)"
  }
]`;

const example = `[
  {
    "front": "What is the function of the mitochondria?",
    "back": "The mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions (the powerhouse of the cell).",
    "grade": "Grade 12",
    "subject": "Biology",
    "unit": "Cell Structure"
  }
]`;

export default function ImportFlashcards() {
  return (
    <JsonImport
      title="Import Flashcards"
      endpoint="/api/admin/import/flashcards"
      schema={schema}
      example={example}
      entityName="flashcard"
    />
  );
}
