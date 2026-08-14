// Xáo trộn mảng theo thuật toán Fisher-Yates (không thay đổi mảng gốc)
export function shuffleArray<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Nhãn A/B/C/D... theo ĐÚNG vị trí hiển thị hiện tại của đáp án (sau khi đã xáo
// trộn) — không gán cứng theo thứ tự gốc trong dữ liệu, để nhãn luôn khớp với vị
// trí thật trên màn hình dù đáp án đã được đảo lại.
export function optionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

// Sắp xếp lại 1 mảng đáp án theo thứ tự id đã lưu (dùng để giữ nguyên thứ tự
// đáp án đã xáo trộn ban đầu của 1 lượt thi khi tải lại trang).
export function reorderById<T extends { id: string }>(items: T[], order: string[] | undefined): T[] {
  if (!order || order.length === 0) return items;
  const byId = new Map(items.map((o) => [o.id, o]));
  const reordered = order.map((id) => byId.get(id)).filter((o): o is T => Boolean(o));
  for (const o of items) {
    if (!order.includes(o.id)) reordered.push(o);
  }
  return reordered;
}
