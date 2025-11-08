"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { GameSession } from "@/lib/types"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  cost: {
    label: "Cost ($)",
    color: "hsl(var(--chart-1))",
  },
} satisfies import("@/components/ui/chart").ChartConfig

interface PerformanceChartProps {
  data: GameSession[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.map((game, index) => ({
      game: `Game ${index + 1}`,
      cost: game.cost,
  }));
    
  if (data.length === 0) {
    return (
        <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed text-muted-foreground">
            Run a simulation to see chart data.
        </div>
    )
  }

  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
            top: 10,
          }}
        >
          <CartesianGrid vertical={false} />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <XAxis
            dataKey="game"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" formatter={(value) => `$${Number(value).toFixed(2)}`}/>}
          />
          <Area
            dataKey="cost"
            type="natural"
            fill="var(--color-cost)"
            fillOpacity={0.4}
            stroke="var(--color-cost)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
  )
}
