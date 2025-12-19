import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import React from "react";

export const Route = createFileRoute("/")({
  component: App,
});

import { ArrowUpRight01Icon, Moon01Icon, Sun03Icon, SolarSystem01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { usePrefs, usePrefsDispatch } from "@/components/ctx/prefs/context";

export const description = "A pie chart with a label";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

function ThemeToggle() {
  const { theme } = usePrefs();
  const dispatch = usePrefsDispatch();

  const [icon, setIcon] = React.useState(SolarSystem01Icon);
  React.useEffect(() => {
    if (theme.app.actual === "system") setIcon(SolarSystem01Icon);
    else if (theme.app.actual === "dark") setIcon(Moon01Icon);
    else if (theme.app.actual === "light") setIcon(Sun03Icon);
  }, [theme.app.actual]);
  return (
    <Button
      className="absolute right-4 top-4"
      variant="outline"
      size="lg"
      onClick={() => dispatch({ type: "theme.app.toggle" })}
    >
      Toggle Theme
      <HugeiconsIcon icon={icon} />
    </Button>
  );
}

export function App() {
  return (
    <div className="grid place-content-center h-dvh">
      <ThemeToggle />
      <Card className="flex flex-col max-w-prose">
        <CardHeader className="items-center pb-0">
          <CardTitle>Pie Chart - Label</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-62.5 pb-0"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={chartData} dataKey="visitors" label nameKey="browser" />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            Trending up by 5.2% this month <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">Showing total visitors for the last 6 months</div>
        </CardFooter>
      </Card>
    </div>
  );
}
