"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getDisplayName, setDisplayName } from "@/lib/localAttempts";

// Không cần tài khoản để thi. Tên (không bắt buộc) chỉ dùng để hiển thị lại
// trong lịch sử làm bài trên chính máy này.
export default function ExamStartButton() {
  const router = useRouter();
  const [name, setName] = useState(() => getDisplayName());

  function handleStart(e: FormEvent) {
    e.preventDefault();
    setDisplayName(name.trim());
    router.push("/exam/session");
  }

  return (
    <form onSubmit={handleStart} className="mt-6 flex flex-col gap-3">
      <div>
        <label className="label" htmlFor="display_name">
          Tên của bạn (không bắt buộc, hiện trong lịch sử làm bài)
        </label>
        <input
          id="display_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="Nguyễn Văn A"
          maxLength={80}
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        Bắt đầu thi
      </button>
    </form>
  );
}
