import { useId } from "react";
import { LEGEND_STAGE, getPartner, growthStage } from "@/lib/partners";
import { AnimalArt } from "./AnimalArt";
import { PlantArt } from "./PlantArt";

interface Props {
  partnerId: string;
  level: number;
  size?: number;
  className?: string;
  /** 図鑑などで成長段階を直接指定したいとき */
  stage?: number;
  /** 未発見表示（シルエット） */
  silhouette?: boolean;
}

/** 育成パートナー（植物・動物）。Lv.100 は伝説形態として光とキラキラを付ける */
export function Partner({ partnerId, level, size = 48, className, stage, silhouette }: Props) {
  const def = getPartner(partnerId);
  const st = stage ?? growthStage(level);
  const legend = st === LEGEND_STAGE;
  const gid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${legend ? def.legendName : def.name} Lv.${level}`}
      style={silhouette ? { filter: "grayscale(1) brightness(0.9)", opacity: 0.35 } : undefined}
    >
      {legend && (
        <>
          <defs>
            <radialGradient id={`aura-${gid}`}>
              <stop offset="0%" stopColor="#fff6c9" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#ffe08a" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffe08a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="30" r="31" fill={`url(#aura-${gid})`} />
        </>
      )}
      {def.type === "plant" ? <PlantArt id={def.id} stage={st} /> : <AnimalArt id={def.id} stage={st} />}
      {legend && (
        <g fill="#ffd54a">
          {[
            [8, 12, 1],
            [55, 8, 0.8],
            [58, 36, 0.7],
            [6, 40, 0.7],
          ].map(([x, y, s], i) => (
            <path
              key={i}
              className="hg-twinkle"
              style={{ animationDelay: `${i * 0.4}s` }}
              d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z"
              transform={`translate(${x} ${y}) scale(${s})`}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
