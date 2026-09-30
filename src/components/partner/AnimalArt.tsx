// 動物パートナーの絵（Habit Garden オリジナルのデフォルメ。既存キャラクターの模倣はしない）。
// 共通の丸いからだに、種ごとの耳・顔・しっぽを付けて描き分ける。viewBox 0 0 64 64。
// stage: 0 赤ちゃん / 1 こども / 2 わかもの / 3 おとな / 4 熟練 / 5 伝説形態

interface Palette {
  body: string;
  belly: string;
  accent: string;
}

const NORMAL: Record<string, Palette> = {
  dog: { body: "#d9a066", belly: "#f6e3c8", accent: "#a86b3a" },
  cat: { body: "#a3a9b3", belly: "#f1f2f4", accent: "#6f7580" },
  owl: { body: "#8d6e53", belly: "#eadcc3", accent: "#5e4634" },
  bear: { body: "#8b5a3c", belly: "#dcb68f", accent: "#5e3a25" },
  fox: { body: "#e98a3c", belly: "#fff4e6", accent: "#b85d1c" },
  penguin: { body: "#34435a", belly: "#ffffff", accent: "#f2a33a" },
};

const LEGEND: Record<string, Palette> = {
  dog: { body: "#e9eef5", belly: "#ffffff", accent: "#7fa7d6" }, // 神狼
  cat: { body: "#cdb8ff", belly: "#f3edff", accent: "#8f72e0" }, // 霊猫
  owl: { body: "#3f4f86", belly: "#e3e8ff", accent: "#f2c94c" }, // 賢者梟
  bear: { body: "#c9953c", belly: "#f6dea2", accent: "#8f6420" }, // 神熊
  fox: { body: "#fff1d6", belly: "#ffffff", accent: "#f0a030" }, // 九尾
  penguin: { body: "#6fa9d6", belly: "#f2fbff", accent: "#bfe8ff" }, // 氷帝鳥
};

const SCALE = [0.62, 0.72, 0.82, 0.92, 1, 1];

export function AnimalArt({ id, stage }: { id: string; stage: number }) {
  const legend = stage === 5;
  const pal = (legend ? LEGEND : NORMAL)[id] ?? NORMAL.dog;
  const s = SCALE[stage] ?? 1;
  return (
    <g>
      <ellipse cx="32" cy="60" rx={16 * s} ry="2.2" fill="#000" opacity="0.1" />
      <g transform={`translate(32 59) scale(${s}) translate(-32 -59)`}>
        <Tail id={id} pal={pal} stage={stage} />
        {/* からだ */}
        <ellipse cx="32" cy="47" rx="14" ry="11.5" fill={pal.body} />
        <ellipse cx="32" cy="50" rx="8.5" ry="7" fill={pal.belly} />
        {id === "owl" &&
          [44, 48, 52].map((y) => (
            <path key={y} d={`M29 ${y} l1.5 1.5 l1.5 -1.5 M32 ${y + 1} l1.5 1.5 l1.5 -1.5`} stroke={pal.accent} strokeWidth="0.7" fill="none" opacity="0.6" />
          ))}
        {id === "penguin" && (
          <>
            <ellipse cx="18.5" cy="47" rx="3" ry="7" fill={pal.body} transform="rotate(20 18.5 47)" />
            <ellipse cx="45.5" cy="47" rx="3" ry="7" fill={pal.body} transform="rotate(-20 45.5 47)" />
          </>
        )}
        {/* 足 */}
        <ellipse cx="26" cy="58" rx="4" ry="2" fill={id === "penguin" ? pal.accent : pal.body} />
        <ellipse cx="38" cy="58" rx="4" ry="2" fill={id === "penguin" ? pal.accent : pal.body} />
        {id === "dog" && legend && <Mane />}
        <Ears id={id} pal={pal} legend={legend} />
        {/* あたま */}
        <circle cx="32" cy="28" r="13" fill={pal.body} />
        <Face id={id} pal={pal} legend={legend} />
        <Accessory id={id} stage={stage} pal={pal} />
      </g>
    </g>
  );
}

function Ears({ id, pal, legend }: { id: string; pal: Palette; legend: boolean }) {
  switch (id) {
    case "dog":
      return legend ? (
        // 神狼：とがった耳
        <>
          <path d="M21 22 L22 8 L30 17 Z" fill={pal.body} />
          <path d="M43 22 L42 8 L34 17 Z" fill={pal.body} />
          <path d="M23 19 L23.5 11 L28 16 Z" fill={pal.accent} opacity="0.6" />
          <path d="M41 19 L40.5 11 L36 16 Z" fill={pal.accent} opacity="0.6" />
        </>
      ) : (
        // たれ耳
        <>
          <ellipse cx="19.5" cy="27" rx="4.5" ry="8" fill={pal.accent} transform="rotate(20 19.5 27)" />
          <ellipse cx="44.5" cy="27" rx="4.5" ry="8" fill={pal.accent} transform="rotate(-20 44.5 27)" />
        </>
      );
    case "cat":
      return (
        <>
          <path d="M21 21 L21 9 L31 16 Z" fill={pal.body} />
          <path d="M43 21 L43 9 L33 16 Z" fill={pal.body} />
          <path d="M23 18 L23 12.5 L28 16 Z" fill="#f7c6cf" />
          <path d="M41 18 L41 12.5 L36 16 Z" fill="#f7c6cf" />
        </>
      );
    case "owl":
      return (
        <>
          <path d="M20 19 L19 10 L27 16 Z" fill={pal.accent} />
          <path d="M44 19 L45 10 L37 16 Z" fill={pal.accent} />
        </>
      );
    case "bear":
      return (
        <>
          <circle cx="21.5" cy="17.5" r="5" fill={pal.body} />
          <circle cx="42.5" cy="17.5" r="5" fill={pal.body} />
          <circle cx="21.5" cy="17.5" r="2.6" fill={pal.belly} />
          <circle cx="42.5" cy="17.5" r="2.6" fill={pal.belly} />
        </>
      );
    case "fox":
      return (
        <>
          <path d="M20 22 L19 6 L30 16 Z" fill={pal.body} />
          <path d="M44 22 L45 6 L34 16 Z" fill={pal.body} />
          <path d="M19.6 11 L19 6 L23 9.5 Z" fill={legend ? pal.accent : "#5a3a28"} />
          <path d="M44.4 11 L45 6 L41 9.5 Z" fill={legend ? pal.accent : "#5a3a28"} />
        </>
      );
    default:
      return null;
  }
}

function Eyes({ y = 28, dx = 5, r = 1.8 }: { y?: number; dx?: number; r?: number }) {
  return (
    <>
      <circle cx={32 - dx} cy={y} r={r} fill="#2b2522" />
      <circle cx={32 + dx} cy={y} r={r} fill="#2b2522" />
      <circle cx={32 - dx + 0.6} cy={y - 0.7} r={r * 0.35} fill="#fff" />
      <circle cx={32 + dx + 0.6} cy={y - 0.7} r={r * 0.35} fill="#fff" />
    </>
  );
}

function Face({ id, pal, legend }: { id: string; pal: Palette; legend: boolean }) {
  const blush = (
    <>
      <ellipse cx="24" cy="32" rx="2.2" ry="1.3" fill="#ff9aa8" opacity="0.5" />
      <ellipse cx="40" cy="32" rx="2.2" ry="1.3" fill="#ff9aa8" opacity="0.5" />
    </>
  );
  switch (id) {
    case "owl":
      return (
        <>
          <circle cx="26.5" cy="27" r="5" fill={pal.belly} />
          <circle cx="37.5" cy="27" r="5" fill={pal.belly} />
          <Eyes y={27} dx={5.5} r={2.3} />
          <path d="M30.5 31 L33.5 31 L32 34 Z" fill="#f2a33a" />
          {legend && (
            // 賢者梟：丸めがね
            <g stroke={pal.accent} strokeWidth="0.9" fill="none">
              <circle cx="26.5" cy="27" r="4" />
              <circle cx="37.5" cy="27" r="4" />
              <path d="M30.5 27 H33.5" />
            </g>
          )}
        </>
      );
    case "penguin":
      return (
        <>
          <ellipse cx="32" cy="31" rx="9" ry="7.5" fill={pal.belly} />
          <Eyes y={29} dx={4} />
          <path d="M29.5 32 L34.5 32 L32 35 Z" fill={legend ? "#ffd27a" : pal.accent} />
          {blush}
        </>
      );
    case "bear":
      return (
        <>
          <Eyes y={26} dx={5} />
          <ellipse cx="32" cy="32" rx="5" ry="3.8" fill={pal.belly} />
          <ellipse cx="32" cy="30.8" rx="1.8" ry="1.2" fill="#2b2522" />
          <path d="M32 32 V33.5 M30.5 34 Q32 35 33.5 34" stroke="#2b2522" strokeWidth="0.7" fill="none" />
          {blush}
        </>
      );
    case "fox":
      return (
        <>
          <path d="M20 30 Q26 38 32 36 Q38 38 44 30 Q38 33 32 32 Q26 33 20 30 Z" fill={pal.belly} />
          <Eyes y={27} dx={5} />
          <ellipse cx="32" cy="32" rx="1.5" ry="1" fill="#2b2522" />
          {legend && <path d="M32 16 l1.2 2.2 -1.2 2.2 -1.2 -2.2 Z" fill={pal.accent} />}
        </>
      );
    case "cat":
      return (
        <>
          <Eyes y={27} dx={5} />
          <path d="M31 31 L33 31 L32 32.3 Z" fill="#e88a9a" />
          <path d="M32 32.3 Q30.5 34 29 33 M32 32.3 Q33.5 34 35 33" stroke="#2b2522" strokeWidth="0.6" fill="none" />
          <path d="M22 30 H17 M22 32 L17 33 M42 30 H47 M42 32 L47 33" stroke={pal.accent} strokeWidth="0.5" />
          {legend && <path d="M32 16 l1.2 2 -1.2 2 -1.2 -2 Z" fill={pal.accent} />}
          {blush}
        </>
      );
    default:
      // dog
      return (
        <>
          <Eyes y={27} dx={5} />
          <ellipse cx="32" cy="32" rx="5" ry="3.8" fill={pal.belly} />
          <ellipse cx="32" cy="30.8" rx="2" ry="1.4" fill="#2b2522" />
          <path d="M32 32.2 V33.5 M30.5 34 Q32 35 33.5 34" stroke="#2b2522" strokeWidth="0.7" fill="none" />
          {blush}
        </>
      );
  }
}

function Tail({ id, pal, stage }: { id: string; pal: Palette; stage: number }) {
  if (id === "fox") {
    // しっぽは成長とともに増え、伝説形態（九尾）で9本
    const n = stage === 5 ? 9 : stage >= 4 ? 3 : stage >= 3 ? 2 : 1;
    const spread = n === 1 ? [0] : Array.from({ length: n }, (_, i) => -70 + (140 / (n - 1)) * i);
    return (
      <g>
        {spread.map((a) => (
          <g key={a} transform={`rotate(${a} 32 50)`}>
            <path d="M32 50 Q30 34 36 26 Q42 34 32 50 Z" fill={pal.body} transform="translate(0 -4)" />
            <path d="M36 26 Q38.5 29 38 31.5 Q35.5 30.5 34.5 28 Z" fill={pal.belly} transform="translate(0 -4)" />
          </g>
        ))}
      </g>
    );
  }
  if (id === "cat") return <path d="M44 52 Q54 50 52 40 Q51 36 48 38" stroke={pal.body} strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  if (id === "dog") return <path d="M45 46 Q52 42 50 36" stroke={pal.body} strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  if (id === "bear") return <circle cx="45.5" cy="52" r="3" fill={pal.body} />;
  return null;
}

/** 神狼のたてがみ */
function Mane() {
  return (
    <g fill="#c9d8ee">
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d="M32 40 L29 30 L35 30 Z" transform={`rotate(${-80 + i * 20} 32 36)`} />
      ))}
    </g>
  );
}

/** 成長に合わせた小物（ガーデン風）と、伝説形態の固有装飾 */
function Accessory({ id, stage, pal }: { id: string; stage: number; pal: Palette }) {
  if (stage === 5) {
    if (id === "owl")
      return (
        <g>
          <rect x="41" y="48" width="9" height="7" rx="1" fill="#f6f1e4" stroke={pal.accent} strokeWidth="0.8" />
          <path d="M45.5 48 V55" stroke={pal.accent} strokeWidth="0.6" />
          <path d="M32 11 l1.3 2.7 3 .4 -2.2 2 .6 3 -2.7 -1.5 -2.7 1.5 .6 -3 -2.2 -2 3 -.4 Z" fill={pal.accent} />
        </g>
      );
    if (id === "bear")
      return (
        <g>
          <circle cx="32" cy="46" r="3.2" fill="#fff3c4" stroke="#e0a82e" strokeWidth="0.8" />
          <path d="M22 17 q10 -6 20 0" stroke="#6fae4f" strokeWidth="1.6" fill="none" />
          {[24, 28, 32, 36, 40].map((x, i) => (
            <ellipse key={x} cx={x} cy={15 - (i === 2 ? 1.5 : i % 2 ? 1 : 0)} rx="1.6" ry="1" fill="#7fc35a" />
          ))}
        </g>
      );
    if (id === "penguin")
      return (
        <g fill={pal.accent} stroke="#e8f8ff" strokeWidth="0.5">
          <path d="M26 17 L28 9 L30 17 Z" />
          <path d="M30 16 L32 5 L34 16 Z" />
          <path d="M34 17 L36 9 L38 17 Z" />
        </g>
      );
    if (id === "cat")
      return (
        <g fill={pal.accent} opacity="0.7">
          <path d="M12 26 q-3 -5 1 -8 q0 4 3 5 q-1 3 -4 3 Z" />
          <path d="M52 22 q-3 -5 1 -8 q0 4 3 5 q-1 3 -4 3 Z" />
        </g>
      );
    return null;
  }
  return (
    <g>
      {stage >= 2 && stage < 4 && (
        // 頭の小さな芽
        <g>
          <path d="M32 15 V11" stroke="#4a9a55" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="30" cy="10.5" rx="2.4" ry="1.3" fill="#6cc070" transform="rotate(-25 30 10.5)" />
          <ellipse cx="34" cy="10" rx="2.4" ry="1.3" fill="#6cc070" transform="rotate(25 34 10)" />
        </g>
      )}
      {stage >= 3 && (
        // スカーフ
        <path d="M22 38 Q32 43 42 38 L42 40.5 Q32 46 22 40.5 Z" fill="#4fae6a" />
      )}
      {stage >= 4 && (
        // 花かんむり
        <g>
          {[-9, -4.5, 0, 4.5, 9].map((dx, i) => (
            <circle key={dx} cx={32 + dx} cy={16.5 - (i === 2 ? 1 : i % 2 ? 0.5 : 0)} r="1.8" fill={["#ffb7cf", "#ffe07a", "#ffffff", "#ffe07a", "#ffb7cf"][i]} />
          ))}
        </g>
      )}
    </g>
  );
}
