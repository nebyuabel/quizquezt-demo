import JsonImport from "@/components/admin/JsonImport";

const schema = `[
  {
    "question_text": "string (required)",
    "options": [
      { "label": "A", "text": "option text" },
      { "label": "B", "text": "option text" },
      { "label": "C", "text": "option text" },
      { "label": "D", "text": "option text" }
    ],
    "correct_answer": "string (A, B, C, or D)",
    "explanation": "string (optional)",
    "difficulty": "number (1-5, optional)",
    "grade": "string (e.g., Grade 12)",
    "subject": "string (e.g., Physics)",
    "unit": "string (e.g., Kinematics)"
  }
]`;

const example = `[
  {
    "question_text": "What is the acceleration due to gravity?",
    "options": [
      { "label": "A", "text": "9.8 m/s²" },
      { "label": "B", "text": "10.0 m/s²" },
      { "label": "C", "text": "8.9 m/s²" },
      { "label": "D", "text": "11.2 m/s²" }
    ],
    "correct_answer": "A",
    "explanation": "Standard acceleration near Earth's surface.",
    "difficulty": 1,
    "grade": "Grade 12",
    "subject": "Physics",
    "unit": "Kinematics"
  }
]`;

export default function ImportQuestions() {
  return (
    <JsonImport
      title="Import Questions"
      endpoint="/api/admin/import/questions"
      schema={schema}
      example={example}
      entityName="question"
    />
  );
}
