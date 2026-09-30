import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 開発サーバーへ LAN / テザリング経由でアクセスするためのホスト許可。
  // これが無いと iPhone など別端末からの /_next リソース（HMR 等）が 403 になり、
  // ページが起動（ハイドレーション）せず「読み込み中」のまま止まる。本番ビルドには影響しない。
  allowedDevOrigins: [
    "172.20.10.*", // iPhone テザリング
    "172.16.*.*",
    "192.168.*.*",
    "10.*.*.*",
    "*.local",
  ],
};

export default nextConfig;
