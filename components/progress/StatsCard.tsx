import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  subtitle?: string;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  color,
  subtitle,
}: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 ${color} bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
}
