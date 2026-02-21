interface MiniSparklineProps {
    data: number[];
    color: string;
}

export default function MiniSparkline({ data, color }: MiniSparklineProps) {
    const max = Math.max(...data);
    const pts = data.map((v, i) => [i * (50 / (data.length - 1)), 18 - (v / max) * 16]);
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
    return (
        <svg width="54" height="22" viewBox="0 0 54 22" className="opacity-60">
            <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
        </svg>
    );
}
