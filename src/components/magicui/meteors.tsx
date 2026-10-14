"use client";

import { cn } from "@/lib/utils";

interface MeteorsProps {
    number?: number;
}

// Pseudo-aleatório determinístico por semente: o servidor e o cliente geram o
// mesmo resultado, então não precisa de effect nem há mismatch de hidratação.
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export const Meteors = ({ number = 20 }: MeteorsProps) => {
    const meteorStyles: React.CSSProperties[] = Array.from({ length: number }, (_, idx) => ({
        top: -5,
        left: Math.floor(seededRandom(idx + 1) * 100) + "%",
        animationDelay: seededRandom(idx + 101) * 1 + 0.2 + "s",
        animationDuration: Math.floor(seededRandom(idx + 201) * 8 + 2) + "s",
    }));

    return (
        <>
            {[...meteorStyles].map((style, idx) => (
                // Meteor Head
                <span
                    key={idx}
                    className={cn(
                        "pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
                    )}
                    style={style}
                >
                    {/* Meteor Tail */}
                    <div className="pointer-events-none absolute top-1/2 -z-10 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-slate-500 to-transparent" />
                </span>
            ))}
        </>
    );
};
