// Simple spatial navigation: every focusable element has data-row / data-col.
// Arrow keys move focus to the nearest element in that direction.
export function handleArrowKeys(e) {
  const dirs = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  const d = dirs[e.key];
  if (!d) return;
  const items = [...document.querySelectorAll("[data-row]")];
  const cur = document.activeElement?.dataset?.row !== undefined ? document.activeElement : items[0];
  if (!cur) return;
  e.preventDefault();
  const r = +cur.dataset.row, c = +cur.dataset.col;
  const at = (row, col) => items.find((el) => +el.dataset.row === row && +el.dataset.col === col);
  let next;
  if (d[0] === 0) {
    next = at(r, c + d[1]);
  } else {
    // move to nearest row in direction, same or closest column
    const rows = [...new Set(items.map((el) => +el.dataset.row))].sort((a, b) => a - b);
    const target = rows[rows.indexOf(r) + d[0]];
    if (target !== undefined) {
      const cands = items.filter((el) => +el.dataset.row === target);
      next = cands.reduce((a, b) => (Math.abs(+b.dataset.col - c) < Math.abs(+a.dataset.col - c) ? b : a));
    }
  }
  if (next) {
    next.focus();
    next.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  }
}
