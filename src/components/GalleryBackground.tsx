// src/components/GalleryBackground.tsx
"use client";

import { easeInOut, motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const COLUMNS = [
  {
    images: [
      "https://picsum.photos/800/1200?random=1",
      "https://picsum.photos/800/1200?random=2",
      "https://picsum.photos/800/1200?random=3",
    ],
    topOffset: "-45%",
    parallaxMaxY: "80vh",
    autoRange: ["-5vh", "5vh"],
    autoDuration: 4,
  },
  {
    images: [
      "https://picsum.photos/800/1200?random=4",
      "https://picsum.photos/800/1200?random=5",
      "https://picsum.photos/800/1200?random=6",
    ],
    topOffset: "-95%",
    parallaxMaxY: "150vh",
    autoRange: ["-8vh", "8vh"],
    autoDuration: 6,
  },
  {
    images: [
      "https://picsum.photos/800/1200?random=7",
      "https://picsum.photos/800/1200?random=8",
      "https://picsum.photos/800/1200?random=9",
    ],
    topOffset: "-75%",
    parallaxMaxY: "130vh",
    autoRange: ["-6vh", "6vh"],
    autoDuration: 5,
  },
  {
    images: [
      "https://picsum.photos/800/1200?random=10",
      "https://picsum.photos/800/1200?random=11",
      "https://picsum.photos/800/1200?random=12",
    ],
    topOffset: "-35%",
    parallaxMaxY: "60vh",
    autoRange: ["-4vh", "4vh"],
    autoDuration: 4.5,
  },
];

interface GalleryBackgroundProps {
  parallax?: boolean;
  dim?: boolean;
}

export default function GalleryBackground({
  parallax = true,
  dim = false,
}: GalleryBackgroundProps) {
  const { scrollYProgress } = useScroll();

  return (
    <div
      className="fixed inset-0 z-[-1] flex flex-row gap-[2vw] p-[2vw] box-border overflow-hidden bg-foreground h-[175vh]"
      aria-hidden="true"
    >
      {COLUMNS.map((col, idx) => (
        <GalleryColumn
          key={idx}
          images={col.images}
          topOffset={col.topOffset}
          parallax={parallax}
          parallaxMaxY={col.parallaxMaxY}
          scrollYProgress={scrollYProgress}
          autoRange={col.autoRange}
          autoDuration={col.autoDuration}
          dim={dim}
        />
      ))}
    </div>
  );
}

interface GalleryColumnProps {
  images: string[];
  topOffset: string;
  parallax: boolean;
  parallaxMaxY: string;
  scrollYProgress: any;
  autoRange: any;
  autoDuration: number;
  dim: boolean;
}

function GalleryColumn({
  images,
  topOffset,
  parallax,
  parallaxMaxY,
  scrollYProgress,
  autoRange,
  autoDuration,
  dim,
}: GalleryColumnProps) {
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", parallaxMaxY]);

  const autoAnimate = {
    y: autoRange,
    transition: {
      y: {
        repeat: Infinity,
        repeatType: "mirror" as const,
        duration: autoDuration,
        ease: easeInOut,
      },
    },
  };

  return (
    <motion.div
      className="relative flex w-1/4 min-w-[250px] h-full flex-col gap-[2vw]"
      style={{
        top: topOffset,
        ...(parallax ? { translateY: y } : {}),
      }}
      animate={parallax ? undefined : autoAnimate}
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="relative w-full h-full overflow-hidden"
          style={dim ? { filter: "brightness(0.6)" } : undefined}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 768px) 250px, 25vw"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
        </div>
      ))}
    </motion.div>
  );
}
