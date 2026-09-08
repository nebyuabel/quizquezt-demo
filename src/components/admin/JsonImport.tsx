"use client";

import { useState } from "react";

interface JsonImportProps {
  title: string;
  endpoint: string;
  schema: string;
  example: string;
  entityName: string; // e.g., "question", "flashcard", "note"
}

export default function JsonImport({
  title,
  endpoint,
  schema,
  example,
  entityName,
}: JsonImportProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      setMessage({ text: "Please paste JSON data.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);
    setResult(null);

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of objects.");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsed }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      setMessage({
        text: `Successfully imported ${data.imported} ${entityName}s.`,
        type: "success",
      });
      setResult(data);
      setJsonInput("");
    } catch (err: any) {
      setMessage({
        text: err.message || "Invalid JSON or server error.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="font-display-lg text-display-lg text-on-surface mb-2">
        {title}
      </h1>
      <p className="text-text-muted mb-6">
        Paste a JSON array of {entityName}s to bulk import. Use an AI assistant
        to convert your PDF or Word document into this format.
      </p>

      <div className="bg-surface-charcoal rounded-xl p-6 mb-6 border border-border-subtle">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-3">
          Expected JSON Format
        </h2>
        <p className="text-sm text-text-muted mb-3">
          Copy this schema and provide it to your AI assistant along with your
          content.
        </p>
        <div className="bg-surface-container p-4 rounded-lg overflow-x-auto">
          <pre className="text-xs text-text-muted whitespace-pre-wrap">
            {schema}
          </pre>
        </div>
        <p className="text-sm text-text-muted mt-3">Example:</p>
        <div className="bg-surface-container p-4 rounded-lg overflow-x-auto">
          <pre className="text-xs text-text-muted whitespace-pre-wrap">
            {example}
          </pre>
        </div>
      </div>

      <div className="bg-surface-charcoal rounded-xl p-6 border border-border-subtle">
        <label className="font-label-md text-label-md text-on-surface block mb-2">
          Paste JSON Array
        </label>
        <textarea
          className="w-full bg-[#14141A] text-on-surface font-body-md text-body-md p-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-shadow min-h-[200px] border border-transparent focus:border-primary"
          placeholder={`Paste JSON array of ${entityName}s here...`}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          disabled={loading}
        />
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleImport}
            disabled={loading}
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-80 transition disabled:opacity-50"
          >
            {loading ? "Importing..." : `Import ${entityName}s`}
          </button>
          {message && (
            <span
              className={`text-sm ${message.type === "success" ? "text-success-green" : "text-error"}`}
            >
              {message.text}
            </span>
          )}
        </div>

        {result && result.errors && result.errors.length > 0 && (
          <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-error font-label-sm">Errors during import:</p>
            <ul className="text-sm text-text-muted list-disc list-inside mt-1 max-h-40 overflow-y-auto">
              {result.errors.map((err: string, idx: number) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
