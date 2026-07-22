import { Boxes, KeyRound, LayoutDashboard, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metrics = [
  {
    label: "Registered apps",
    value: "2",
    icon: Boxes,
  },
  {
    label: "Auth mode",
    value: "SSO",
    icon: KeyRound,
  },
  {
    label: "Runtime",
    value: "Qiankun",
    icon: Route,
  },
];

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <Badge className="w-fit" variant="secondary">
          <LayoutDashboard />
          Shell dashboard
        </Badge>
        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
          Dashboard
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          Super Web Shell hosts domain mini apps behind a shared navigation,
          auth context, and operational wrapper. This home route stays in the
          shell while mini apps mount only on their configured routes.
        </p>
      </section>

      <section
        aria-label="Shell overview"
        className="grid gap-4 md:grid-cols-3"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} size="sm">
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {metric.label}
                </CardDescription>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Shell boundary</CardTitle>
          <CardDescription className="max-w-3xl leading-7">
            The shell owns routing, layout, and launch context. The mini app
            receives user context and token through Qiankun props instead of a
            URL query string.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground md:grid-cols-3">
            <span>Shared route ownership</span>
            <span>Auth0-backed session context</span>
            <span>Qiankun mount lifecycle</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
