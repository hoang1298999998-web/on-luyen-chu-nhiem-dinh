"use client";

import { useState, type ChangeEvent } from "react";
import * as XLSX from "xlsx";
import type { QuestionOption } from "@/lib/types";

type ParsedRow = {
  rowNumber: number;
  content: string;
  options: QuestionOption[];
  correct_option_id: string;
  source: string | null;
  valid: boolean;
  errorMessage?: string;
};

type ImportResult = {
  inserted: number;
  skipped: number;
  errors: string[];
};

const MAX_OPTIONS = 6;

function parseWorkbook(buffer: ArrayBuffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  return rawRows.map((raw, index) => {
    const rowNumber = index + 2; // dòng 1 là tiêu đề trong Excel
    const content = String(raw["Câu hỏi"] ?? "").trim();

    const options: QuestionOption[] = [];
    for (let i = 1; i <= MAX_OPTIONS; i++) {
      const text = String(raw[`Đáp án ${i}`] ?? "").trim();
      if (text) options.push({ id: String(i), text });
    }

    const correctRaw = String(raw["Đáp án đúng"] ?? "").trim();
    const sourceRaw = String(raw["Nguồn / Hướng dẫn"] ?? raw["Nguồn"] ?? "").trim();

    let errorMessage: string | undefined;
    if (!content) errorMessage = "Thiếu nội dung câu hỏi.";
    else if (options.length < 2) errorMessage = "Cần ít nhất 2 đáp án.";
    else if (!correctRaw) errorMessage = "Thiếu cột Đáp án đúng.";
    else if (!options.some((o) => o.id === correctRaw))
      errorMessage = `Đáp án đúng "${correctRaw}" không khớp với đáp án nào đã nhập.`;

    return {
      rowNumber,
      content,
      options,
      correct_option_id: correctRaw,
      source: sourceRaw || null,
      valid: !errorMessage,
      errorMessage,
    };
  });
}

export default function AdminUploadPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setParseError(null);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseWorkbook(buffer);
      if (parsed.length === 0) {
        setParseError("Không đọc được dòng dữ liệu nào trong file.");
      }
      setRows(parsed);
    } catch {
      setParseError("Không đọc được file. Vui lòng kiểm tra định dạng file Excel (.xlsx).");
      setRows([]);
    }
  }

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  async function handleImport() {
    if (validRows.length === 0) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: validRows.map((r) => ({
            content: r.content,
            options: r.options,
            correct_option_id: r.correct_option_id,
            source: r.source,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Nhập câu hỏi thất bại.");
      setResult(json);
      setRows([]);
      setFileName(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Nhập câu hỏi thất bại.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nhập câu hỏi từ Excel</h1>
        <p className="mt-1 text-sm text-slate-500">
          File Excel (.xlsx) cần có các cột: <b>Câu hỏi</b>, <b>Đáp án 1</b> .. <b>Đáp án 6</b> (2-6 cột, để
          trống cột không dùng), <b>Đáp án đúng</b> (điền số thứ tự đáp án đúng, vd: 2), và{" "}
          <b>Nguồn / Hướng dẫn</b> (không bắt buộc).
        </p>
      </div>

      <div className="card flex flex-col gap-4">
        <div>
          <label className="label">Chọn file Excel</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
          />
          {fileName && <p className="mt-2 text-sm text-slate-500">Đã chọn: {fileName}</p>}
        </div>

        {parseError && <p className="text-sm text-red-600">{parseError}</p>}

        {rows.length > 0 && (
          <>
            <div className="flex gap-3 text-sm">
              <span className="rounded-full bg-correct-bg px-3 py-1 font-medium text-correct-text">
                {validRows.length} câu hợp lệ
              </span>
              {invalidRows.length > 0 && (
                <span className="rounded-full bg-wrong-bg px-3 py-1 font-medium text-wrong-text">
                  {invalidRows.length} câu lỗi
                </span>
              )}
            </div>

            <div className="max-h-96 overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Dòng</th>
                    <th className="px-3 py-2">Câu hỏi</th>
                    <th className="px-3 py-2">Số đáp án</th>
                    <th className="px-3 py-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.rowNumber} className={r.valid ? "" : "bg-wrong-bg/40"}>
                      <td className="px-3 py-2 text-slate-500">{r.rowNumber}</td>
                      <td className="max-w-sm px-3 py-2 text-slate-800">
                        <span className="line-clamp-1">{r.content || "(trống)"}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{r.options.length}</td>
                      <td className="px-3 py-2">
                        {r.valid ? (
                          <span className="text-correct-text">Hợp lệ</span>
                        ) : (
                          <span className="text-wrong-text">{r.errorMessage}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleImport}
              disabled={importing || validRows.length === 0}
              className="btn-primary self-start"
            >
              {importing ? "Đang nhập..." : `Nhập ${validRows.length} câu hỏi vào ngân hàng đề`}
            </button>
          </>
        )}

        {result && (
          <div className="rounded-lg bg-correct-bg p-4 text-sm text-correct-text">
            <p className="font-semibold">Đã nhập thành công {result.inserted} câu hỏi.</p>
            {result.skipped > 0 && (
              <div className="mt-2 text-wrong-text">
                <p>{result.skipped} dòng bị bỏ qua:</p>
                <ul className="ml-4 list-disc">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
