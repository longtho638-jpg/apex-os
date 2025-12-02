import React, { memo } from 'react';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';

export const MiniSparkline = memo(({ data, color }: { data: number[], color: string }) => {
    return (
        <Sparklines data={data} width={60} height={20} margin={2}>
            <SparklinesLine style={{ stroke: color, strokeWidth: 2, fill: "none" }} />
            <SparklinesSpots size={2} style={{ stroke: color, fill: "white" }} />
        </Sparklines>
    );
});
