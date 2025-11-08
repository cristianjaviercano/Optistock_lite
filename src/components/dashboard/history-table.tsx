import type { GameSession } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface HistoryTableProps {
    data: GameSession[];
}

export default function HistoryTable({ data }: HistoryTableProps) {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-24 rounded-md border border-dashed text-muted-foreground">
            No history to display.
        </div>
      )
    }
    return (
      <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Time (s)</TableHead>
                    <TableHead className="text-right">Moves</TableHead>
                    <TableHead className="text-right">Cost ($)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((game) => (
                    <TableRow key={game.id}>
                        <TableCell>{new Date(game.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Badge variant={game.mode === 'picking' ? 'default' : 'secondary'}>
                                {game.mode.charAt(0).toUpperCase() + game.mode.slice(1)}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{game.time}</TableCell>
                        <TableCell className="text-right">{game.moves}</TableCell>
                        <TableCell className="text-right font-medium">${game.cost.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>
    )
}
