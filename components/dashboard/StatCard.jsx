import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function StatCard({ icon: Icon, label, value, href, color = "text-navy" }) {
  return (
    <Card className="min-h-36">
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="flex items-center justify-between">
          <div className={`grid h-11 w-11 place-items-center rounded-xl bg-current/10 ${color}`}>
            <Icon size={22} />
          </div>
          <span className="text-3xl font-bold text-navy">{value}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-600">{label}</p>
          <a href={href} className={`mt-2 inline-flex items-center gap-1 text-sm font-bold ${color}`}>
            View all <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </Card>
  );
}
