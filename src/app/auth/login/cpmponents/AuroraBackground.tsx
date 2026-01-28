"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

export default function AnimeBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // 150 个粒子效果
  const particles = Array.from({ length: 150 });

  return (
    <div style={styles.container}>
      <div style={styles.skyBase} />
      <div style={styles.atmosphereGlow} />

      {/* 云雾动效保持不变 */}
      <motion.div
        animate={{ x: ["-10%", "10%"], y: ["-5%", "5%"] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{ ...styles.cloud, ...styles.cloudPurple }}
      />
      <motion.div
        animate={{ x: ["5%", "-5%"], y: ["10%", "-10%"] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{ ...styles.cloud, ...styles.cloudBlue }}
      />

      {/* 优化后的星光下落 */}
      {particles.map((_, i) => {
        // 为每个粒子计算随机初始高度，确保一进页面全屏都有星星
        const startY = Math.random() * 120 - 50; // -20vh 到 100vh
        const startX = Math.random() * 100;
        const duration = 15 + Math.random() * 15; // 15s - 30s 之间，非常平缓

        return (
          <motion.div
            key={i}
            initial={{
              x: `${startX}vw`,
              y: `${startY}vh`,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              // 统一向下落到屏幕下方 10vh 的位置
              y: "110vh",
              // 配合透明度变化：刚出现和快消失时透明，中间段亮起
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              // 使用 linear 线性运动，下落速度才匀速平稳
              ease: "linear",
              // delay 只控制第一次循环后的随机性，设小一点让进入更直接
              delay: Math.random() * 2,
            }}
            style={styles.particle}
          />
        );
      })}

      <div style={styles.sunGlow} />
      <div style={styles.noiseOverlay} />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: "hidden",
    background: "#1e293b",
  },
  skyBase: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #818cf8 75%, #c084fc 100%)",
  },
  atmosphereGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at center, rgba(165, 180, 252, 0.2) 0%, transparent 80%)",
  },
  cloud: {
    position: "absolute",
    width: "100vw",
    height: "100vh",
    filter: "blur(150px)",
    opacity: 0.3,
    pointerEvents: "none",
  },
  cloudPurple: {
    background:
      "radial-gradient(circle at 30% 70%, #f472b6 0%, transparent 50%)",
    top: "-20%",
  },
  cloudBlue: {
    background:
      "radial-gradient(circle at 70% 30%, #2dd4bf 0%, transparent 50%)",
    bottom: "-20%",
  },
  particle: {
    position: "absolute",
    width: "5px",
    height: "5px",
    background: "#fff",
    borderRadius: "50%",
    boxShadow: "0 0 8px 2px rgba(255, 255, 255, 0.5)",
    filter: "blur(0.5px)",
  },
  sunGlow: {
    position: "absolute",
    top: "0%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100vw",
    height: "40vh",
    background:
      "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  noiseOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    opacity: 0.02,
    mixBlendMode: "overlay",
    pointerEvents: "none",
  },
};
