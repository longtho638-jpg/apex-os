import React from 'react';
import { Element, ELEMENTS } from '@/lib/constants/zen-modes';

export function WireframeRadarChart({ data }: { data: Record<Element, number> }) {
    const size = 200;
    const center = size / 2;
    const maxRadius = size / 2 - 30;
    const angleStep = (Math.PI * 2) / 5;

    const dataPoints = ELEMENTS.map((elem, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const value = data[elem.name];
        const radius = (value / 100) * maxRadius;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const gridLevels = [25, 50, 75, 100];

    return (
        <svg width={size} height={size} className="mx-auto">
            <defs>
                <filter id="neon-glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Grid */}
            {gridLevels.map((level) => {
                const gridPoints = ELEMENTS.map((_, i) => {
                    const angle = angleStep * i - Math.PI / 2;
                    const radius = (level / 100) * maxRadius;
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return `${x},${y}`;
                }).join(' ');

                return (
                    <polygon
                        key={level}
                        points={gridPoints}
                        fill="none"
                        stroke="rgba(0,255,255,0.15)"
                        strokeWidth="0.5"
                    />
                );
            })}

            {/* Axis */}
            {ELEMENTS.map((elem, i) => {
                const angle = angleStep * i - Math.PI / 2;
                const x = center + maxRadius * Math.cos(angle);
                const y = center + maxRadius * Math.sin(angle);
                return (
                    <line
                        key={elem.name}
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="rgba(0,255,255,0.2)"
                        strokeWidth="0.5"
                    />
                );
            })}

            {/* Data */}
            <polygon
                points={dataPoints}
                fill="rgba(255, 0, 128, 0.1)"
                stroke="#FF0080"
                strokeWidth="1.5"
                filter="url(#neon-glow)"
            />

            {/* Points */}
            {ELEMENTS.map((elem, i) => {
                const angle = angleStep * i - Math.PI / 2;
                const value = data[elem.name];
                const radius = (value / 100) * maxRadius;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);

                return (
                    <circle
                        key={elem.name}
                        cx={x}
                        cy={y}
                        r="2"
                        fill={elem.color}
                        filter="url(#neon-glow)"
                    />
                );
            })}

            {/* Labels */}
            {ELEMENTS.map((elem, i) => {
                const angle = angleStep * i - Math.PI / 2;
                const labelRadius = maxRadius + 18;
                const x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);

                return (
                    <text
                        key={elem.name}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[9px] font-mono"
                        fill={elem.color}
                    >
                        {elem.icon}
                    </text>
                );
            })}
        </svg>
    );
}
