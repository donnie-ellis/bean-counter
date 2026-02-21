interface GaugeRingProps {
    pct: number;
    color: string;
    size?: number;
}


export default function GaugeRing({ pct: p, color, size = 72 }: GaugeRingProps) {
    const r = 26, circ = 2 * Math.PI * r;
    const filled = (Math.min(p / 100, 1) * circ * 0.75).toFixed(1);
    const clr = p >= 100 ? "#ef4444" : p >= 85 ? "#f59e0b" : color;
    return (
        <svg width={size} height={size} viewBox="0 0 70 70" className="flex-shrink-0">
            <circle cx="35" cy="35" r={r} fill="none" stroke="#1e293b" strokeWidth="6"
                strokeDasharray={`${(circ * 0.75).toFixed(1)} ${(circ * 0.25).toFixed(1)}`}
                strokeLinecap="round" transform="rotate(-135 35 35)" />
            <circle cx="35" cy="35" r={r} fill="none" stroke={clr} strokeWidth="6"
                strokeDasharray={`${filled} ${(circ - filled).toFixed(1)}`}
                strokeLinecap="round" transform="rotate(-135 35 35)"
                style={{ transition: "stroke-dasharray .7s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
    );
}
