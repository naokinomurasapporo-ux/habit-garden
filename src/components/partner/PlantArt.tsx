// 植物パートナーの絵（Habit Garden オリジナル）。viewBox 0 0 64 64、鉢は下部。
// stage: 0 芽 / 1 若葉 / 2 成長期 / 3 立派な株 / 4 満開 / 5 伝説形態

export function Pot({ legend }: { legend?: boolean }) {
  return (
    <g>
      <path d="M18 48 H46 L42 62 H22 Z" fill={legend ? "#d8a84a" : "#c8764a"} />
      <rect x="16" y="45" width="32" height="5" rx="2" fill={legend ? "#b8872c" : "#b0613a"} />
      <ellipse cx="32" cy="46" rx="14" ry="1.6" fill="#6b4a33" />
      {legend && <path d="M24 55 H40" stroke="#fff3c4" strokeWidth="1" strokeLinecap="round" />}
    </g>
  );
}

function Sprout({ color = "#5fb86a" }: { color?: string }) {
  return (
    <g>
      <path d="M32 46 V36" stroke="#4a9a55" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="27" cy="35" rx="5" ry="2.6" fill={color} transform="rotate(-25 27 35)" />
      <ellipse cx="37" cy="34" rx="5" ry="2.6" fill={color} transform="rotate(25 37 34)" />
    </g>
  );
}

// ---------------- モンステラ / 世界樹 ----------------

function MonsteraLeaf({ x, y, r, rot, color = "#2f8f4e" }: { x: number; y: number; r: number; rot: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx="0" cy="0" rx={r} ry={r * 0.78} fill={color} />
      <path d={`M0 ${-r * 0.7} V${r * 0.7}`} stroke="#236b3a" strokeWidth="0.8" />
      <path
        d={`M${-r} -1 L${-r * 0.35} 0 M${r} -1 L${r * 0.35} 0 M${-r * 0.8} ${r * 0.45} L${-r * 0.3} ${r * 0.2} M${r * 0.8} ${r * 0.45} L${r * 0.3} ${r * 0.2}`}
        stroke="#fff"
        strokeOpacity="0.9"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  );
}

function Monstera({ stage }: { stage: number }) {
  if (stage === 0) return <Sprout />;
  if (stage === 5) return <WorldTree />;
  const leaves = [
    { x: 32, y: 30, r: 7, rot: 0, s: 1 },
    { x: 22, y: 34, r: 6.5, rot: -30, s: 1 },
    { x: 42, y: 33, r: 6.5, rot: 30, s: 2 },
    { x: 26, y: 20, r: 8, rot: -15, s: 3 },
    { x: 40, y: 19, r: 8, rot: 20, s: 3 },
    { x: 33, y: 11, r: 8.5, rot: 5, s: 4 },
    { x: 16, y: 25, r: 7, rot: -45, s: 4 },
    { x: 49, y: 25, r: 7, rot: 45, s: 4 },
  ].filter((l) => l.s <= stage);
  return (
    <g>
      {leaves.map((l, i) => (
        <path key={`s${i}`} d={`M32 46 Q${(32 + l.x) / 2} ${l.y + 8} ${l.x} ${l.y}`} stroke="#3f8a4f" strokeWidth="1.5" fill="none" />
      ))}
      {leaves.map((l, i) => (
        <MonsteraLeaf key={i} {...l} />
      ))}
    </g>
  );
}

/** 世界樹：太い幹と重なる葉の樹冠、光る実 */
function WorldTree() {
  return (
    <g>
      <path d="M29 46 C29 38 27 34 24 30 M35 46 C35 38 37 34 40 30 M32 46 V26" stroke="#7a5236" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M27 46 q-4 1 -7 0 M37 46 q4 1 7 0" stroke="#7a5236" strokeWidth="2" strokeLinecap="round" fill="none" />
      {[
        [32, 17, 13],
        [19, 24, 9],
        [45, 24, 9],
        [24, 11, 8],
        [40, 11, 8],
        [32, 6, 7],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? "#2f8f4e" : "#3ea35c"} />
      ))}
      {[
        [22, 20],
        [34, 13],
        [44, 22],
        [28, 8],
        [38, 26],
        [16, 26],
      ].map(([x, y], i) => (
        <circle key={`f${i}`} cx={x} cy={y} r="1.6" fill="#fff7b0" />
      ))}
    </g>
  );
}

// ---------------- サボテン / 砂漠王樹 ----------------

function Cactus({ stage }: { stage: number }) {
  if (stage === 0) return <Sprout color="#7bbf6a" />;
  const legend = stage === 5;
  const h = [0, 12, 20, 28, 34, 38][stage];
  const top = 46 - h;
  const body = legend ? "#4f9d5a" : "#5aa55c";
  return (
    <g>
      <rect x="26" y={top} width="12" height={h + 2} rx="6" fill={body} />
      {stage >= 2 && (
        <path d={`M26 ${top + h * 0.55} H21 a3 3 0 0 1 -3 -3 V${top + h * 0.2}`} stroke={body} strokeWidth="6" strokeLinecap="round" fill="none" />
      )}
      {stage >= 3 && (
        <path d={`M38 ${top + h * 0.45} H43 a3 3 0 0 0 3 -3 V${top + h * 0.1}`} stroke={body} strokeWidth="6" strokeLinecap="round" fill="none" />
      )}
      {legend && (
        <>
          <path d={`M26 ${top + h * 0.8} H14 a3 3 0 0 1 -3 -3 V${top + h * 0.55}`} stroke={body} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d={`M38 ${top + h * 0.78} H50 a3 3 0 0 0 3 -3 V${top + h * 0.5}`} stroke={body} strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      )}
      <path d={`M32 ${top + 3} V44`} stroke="#468a48" strokeWidth="0.8" />
      {Array.from({ length: Math.floor(h / 6) }, (_, i) => (
        <g key={i} stroke={legend ? "#ffd86b" : "#e8f3d8"} strokeWidth="0.7">
          <path d={`M27 ${top + 5 + i * 6} l-2 -1`} />
          <path d={`M37 ${top + 7 + i * 6} l2 -1`} />
        </g>
      ))}
      {stage >= 4 && (
        <g>
          {(legend ? [-8, 0, 8] : [0]).map((dx) => (
            <g key={dx} transform={`translate(${dx} ${dx ? 3 : 0})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="32" cy={top - 2} rx="2" ry="4" fill={legend ? "#ffb13d" : "#ff6fa3"} transform={`rotate(${a} 32 ${top + 1})`} />
              ))}
              <circle cx="32" cy={top + 1} r="1.8" fill="#ffe680" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

// ---------------- 桜 / 天桜 ----------------

function Sakura({ stage }: { stage: number }) {
  if (stage === 0) return <Sprout color="#8cc97a" />;
  const legend = stage === 5;
  const blossom = legend ? "#ffe3ee" : stage >= 4 ? "#ffb7cf" : stage >= 3 ? "#ffcfe0" : "#8fcf7e";
  const clusters = [
    { x: 32, y: 26, r: 9, s: 1 },
    { x: 22, y: 30, r: 7, s: 2 },
    { x: 42, y: 29, r: 7, s: 2 },
    { x: 27, y: 18, r: 8, s: 3 },
    { x: 39, y: 17, r: 8, s: 3 },
    { x: 16, y: 22, r: 6, s: 4 },
    { x: 48, y: 21, r: 6, s: 4 },
    { x: 33, y: 10, r: 7, s: 4 },
    { x: 11, y: 30, r: 5, s: 5 },
    { x: 53, y: 29, r: 5, s: 5 },
  ].filter((c) => c.s <= stage);
  return (
    <g>
      <path
        d="M32 46 V30 M32 36 L24 29 M32 34 L41 27"
        stroke="#7a5236"
        strokeWidth={stage >= 3 ? 3 : 2}
        strokeLinecap="round"
        fill="none"
      />
      {clusters.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={blossom} opacity="0.95" />
      ))}
      {stage >= 3 &&
        clusters.map((c, i) => <circle key={`d${i}`} cx={c.x + 2} cy={c.y - 2} r="1.3" fill={legend ? "#ff8fb8" : "#ff7aa8"} />)}
      {legend &&
        [
          [8, 40, 20],
          [56, 38, -30],
          [14, 12, 40],
          [52, 10, -10],
        ].map(([x, y, r], i) => (
          <ellipse key={`p${i}`} cx={x} cy={y} rx="2" ry="1.2" fill="#ffc2d6" transform={`rotate(${r} ${x} ${y})`} />
        ))}
    </g>
  );
}

// ---------------- パキラ / 黄金樹 ----------------

function PalmLeaf({ x, y, size, rot, color }: { x: number; y: number; size: number; rot: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[-50, -25, 0, 25, 50].map((a) => (
        <ellipse key={a} cx="0" cy={-size} rx={size * 0.32} ry={size} fill={color} transform={`rotate(${a})`} />
      ))}
    </g>
  );
}

function Pachira({ stage }: { stage: number }) {
  if (stage === 0) return <Sprout color="#6cbf5a" />;
  const legend = stage === 5;
  const trunkTop = [0, 38, 32, 27, 23, 20][stage];
  const trunk = legend ? "#c9962e" : "#9a7048";
  const leaf = legend ? "#f2c94c" : "#4caf50";
  const leaves = [
    { x: 32, y: trunkTop, size: 6, rot: 0, s: 1 },
    { x: 27, y: trunkTop + 4, size: 5, rot: -35, s: 2 },
    { x: 37, y: trunkTop + 3, size: 5, rot: 35, s: 3 },
    { x: 24, y: trunkTop - 1, size: 5.5, rot: -60, s: 4 },
    { x: 40, y: trunkTop - 2, size: 5.5, rot: 60, s: 4 },
    { x: 32, y: trunkTop - 6, size: 6, rot: 0, s: 5 },
  ].filter((l) => l.s <= stage);
  return (
    <g>
      {/* 編み込みの幹 */}
      <path d={`M30 46 C34 42 28 ${trunkTop + 8} 32 ${trunkTop}`} stroke={trunk} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d={`M34 46 C30 42 36 ${trunkTop + 8} 32 ${trunkTop}`} stroke={trunk} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <PalmLeaf key={i} {...l} color={leaf} />
      ))}
      {legend && [22, 42, 32].map((x, i) => <circle key={i} cx={x} cy={trunkTop - 2 + i * 4} r="1.4" fill="#fff6c9" />)}
    </g>
  );
}

// ---------------- ラベンダー / 月光花 ----------------

function Lavender({ stage }: { stage: number }) {
  if (stage === 0) return <Sprout color="#8fbf8a" />;
  const legend = stage === 5;
  const n = [0, 1, 2, 3, 5, 7][stage];
  const flower = legend ? "#b9c8ff" : "#8e6cc8";
  const stems = Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    return { x: 32 + t * 22, top: 20 + Math.abs(t) * 10 - (stage >= 4 ? 4 : 0) };
  });
  return (
    <g>
      {legend && (
        <path d="M49 8 a6 6 0 1 0 5 9 a5 5 0 1 1 -5 -9 Z" fill="#fff4b8" />
      )}
      {stems.map((st, i) => (
        <g key={i}>
          <path d={`M32 46 Q${(32 + st.x) / 2} 38 ${st.x} ${st.top + 8}`} stroke="#6f9a5d" strokeWidth="1.3" fill="none" />
          {Array.from({ length: 5 }, (_, k) => (
            <ellipse key={k} cx={st.x + (k % 2 ? 1.2 : -1.2)} cy={st.top + k * 2} rx="1.8" ry="1.5" fill={flower} />
          ))}
        </g>
      ))}
      <ellipse cx="26" cy="44" rx="4" ry="1.4" fill="#7fae6a" transform="rotate(-20 26 44)" />
      <ellipse cx="38" cy="44" rx="4" ry="1.4" fill="#7fae6a" transform="rotate(20 38 44)" />
    </g>
  );
}

// ---------------- ひまわり / 太陽花 ----------------

function Sunflower({ stage }: { stage: number }) {
  if (stage === 0) return <Sprout color="#79c25f" />;
  const legend = stage === 5;
  const headY = [0, 30, 22, 18, 15, 16][stage];
  const r = [0, 0, 2.5, 5, 7, 9][stage];
  const petals = stage >= 3 ? 14 : 8;
  return (
    <g>
      {legend &&
        Array.from({ length: 12 }, (_, i) => (
          <path key={`r${i}`} d={`M32 ${headY} L32 ${headY - 17}`} stroke="#ffd54a" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" transform={`rotate(${i * 30} 32 ${headY})`} />
        ))}
      <path d={`M32 46 V${headY + r}`} stroke="#4f9a45" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="26" cy={Math.max(headY + 12, 36)} rx="5" ry="2.4" fill="#5caf4e" transform={`rotate(-25 26 ${Math.max(headY + 12, 36)})`} />
      {stage >= 2 && <ellipse cx="38" cy={Math.max(headY + 18, 40)} rx="5" ry="2.4" fill="#5caf4e" transform={`rotate(25 38 ${Math.max(headY + 18, 40)})`} />}
      {stage === 1 && <circle cx="32" cy={headY} r="2.4" fill="#79c25f" />}
      {stage >= 2 && (
        <g>
          {Array.from({ length: petals }, (_, i) => (
            <ellipse key={i} cx="32" cy={headY - r - 1.5} rx={r * 0.35 + 0.5} ry={r * 0.6 + 1} fill={legend ? "#ffb300" : "#ffcd2e"} transform={`rotate(${(360 / petals) * i} 32 ${headY})`} />
          ))}
          <circle cx="32" cy={headY} r={r} fill={legend ? "#b5541c" : "#7a4a24"} />
          {stage >= 3 && <circle cx="30" cy={headY - 2} r={r * 0.25} fill="#9a6333" />}
        </g>
      )}
    </g>
  );
}

const PLANT_ART: Record<string, (p: { stage: number }) => React.ReactElement> = {
  monstera: Monstera,
  cactus: Cactus,
  sakura: Sakura,
  pachira: Pachira,
  lavender: Lavender,
  sunflower: Sunflower,
};

export function PlantArt({ id, stage }: { id: string; stage: number }) {
  const Art = PLANT_ART[id] ?? Monstera;
  return (
    <g>
      <Art stage={stage} />
      <Pot legend={stage === 5} />
    </g>
  );
}
