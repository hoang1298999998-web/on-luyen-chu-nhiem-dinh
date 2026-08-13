"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { QuestionWithAnswer } from "@/lib/types";

const PAGE_SIZE = 20;

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/admin/questions", window.location.origin);
      url.searchParams.set("page", String(p));
      url.searchParams.set("pageSize", String(PAGE_SIZE));
      if (q) url.searchParams.set("q", q);
      const res = await fetch(url.toString());
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không tải được danh sách.");
      setQuestions(json.questions);
      setTotal(json.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load(1, search);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Không thể xoá câu hỏi.");
      }
      await load(page, search);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xoá câu hỏi.");
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ngân hàng câu hỏi</h1>
          <p className="mt-1 text-sm text-slate-500">Tổng cộng {total} câu hỏi.</p>
        </div>
        <Link href="/admin/questions/new" className="btn-primary">
          + Thêm câu hỏi
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          placeholder="Tìm theo nội dung câu hỏi..."
        />
        <button type="submit" className="btn-secondary shrink-0">
          Tìm
        </button>
      </form>

      {error && <div className="card text-red-600">{error}</div>}

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <p className="p-6 text-center text-slate-500">Đang tải...</p>
        ) : questions.length === 0 ? (
          <p className="p-6 text-center text-slate-500">Chưa có câu hỏi nào.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Nội dung câu hỏi</th>
                <th className="px-4 py-3">Số đáp án</th>
                <th className="px-4 py-3">Nguồn</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {questions.map((q) => (
                <tr key={q.id}>
                  <td className="px-4 py-3 text-slate-500">{q.order_index}</td>
                  <td className="max-w-md px-4 py-3 text-slate-800">
                    <span className="line-clamp-2">{q.content}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{q.options.length}</td>
                  <td className="px-4 py-3 text-slate-500">{q.source ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/questions/${q.id}`}
                        className="rounded-md px-2 py-1 text-brand-600 hover:bg-brand-50"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(q.id)}
                        disabled={deletingId === q.id}
                        className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50"
                      >
                        {deletingId === q.id ? "Đang xoá..." : "Xoá"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary"
          >
            ← Trước
          </button>
          <span className="text-sm text-slate-600">
            Trang {page}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
