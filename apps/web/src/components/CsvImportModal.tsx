import { ChangeEvent, useState } from "react";
import { DocumentDownload, DocumentUpload } from "iconsax-react";

export type CsvRow = Record<string, string>;

function parseLine(line: string): string[] {
  const cells: string[] = []; let value = ""; let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { cells.push(value.trim()); value = ""; }
    else value += character;
  }
  cells.push(value.trim()); return cells;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("The CSV must include a header and at least one record");
  const headers = parseLine(lines[0]!).map((header) => header.toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => Object.fromEntries(headers.map((header, index) => [header, parseLine(line)[index] ?? ""])));
}

export function CsvImportModal({ open, title, columns, required, example, busy, onClose, onImport }: {
  open: boolean; title: string; columns: string[]; required: string[]; example: string[]; busy: boolean;
  onClose: () => void; onImport: (rows: CsvRow[]) => Promise<void>;
}) {
  const [rows, setRows] = useState<CsvRow[]>([]); const [fileName, setFileName] = useState(""); const [error, setError] = useState("");
  if (!open) return null;
  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    setError(""); const file = event.target.files?.[0]; if (!file) return;
    try {
      const parsed = parseCsv(await file.text());
      const missing = required.filter((column) => !(column in (parsed[0] ?? {})));
      if (missing.length) throw new Error(`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
      setRows(parsed); setFileName(file.name);
    } catch (reason) { setRows([]); setError(reason instanceof Error ? reason.message : "Could not read the CSV"); }
  }
  function downloadTemplate() {
    const blob = new Blob([`${columns.join(",")}\n${example.join(",")}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-template.csv`; link.click(); URL.revokeObjectURL(url);
  }
  async function importRecords() {
    setError("");
    try { await onImport(rows); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The import could not be completed"); }
  }
  return <div className="modal-layer"><button className="modal-backdrop" onClick={onClose} aria-label="Close" /><section className="modal csv-modal"><header><div><h2>{title}</h2><p>Import up to 1,000 records in one CSV file.</p></div></header><div className="modal-body"><button className="template-button" onClick={downloadTemplate}><DocumentDownload size={20} /><span><strong>Download CSV template</strong><small>Includes the supported column headers and an example row.</small></span></button><label className="upload-zone"><DocumentUpload size={31} /><strong>{fileName || "Choose a CSV file"}</strong><span>{rows.length ? `${rows.length} records ready to import` : `Required: ${required.join(", ")}`}</span><input type="file" accept=".csv,text/csv" onChange={selectFile} /></label>{error && <p className="form-error">{error}</p>}{rows.length > 0 && <div className="csv-preview"><strong>Preview</strong><div className="table-wrap"><table><thead><tr>{columns.slice(0, 4).map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.slice(0, 3).map((row, index) => <tr key={index}>{columns.slice(0, 4).map((column) => <td key={column}>{row[column] || "—"}</td>)}</tr>)}</tbody></table></div>{rows.length > 3 && <small>And {rows.length - 3} more records</small>}</div>}</div><footer><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button primary-button--compact" disabled={!rows.length || busy} onClick={() => void importRecords()}>{busy ? "Importing…" : `Import ${rows.length || ""} records`}</button></footer></section></div>;
}
