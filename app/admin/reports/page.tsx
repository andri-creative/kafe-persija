import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Calendar } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      title: "Today's Revenue",
      value: "Rp 2.450.000",
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingBag,
    },
    {
      title: "Average Order Value",
      value: "Rp 156.410",
      change: "-2.4%",
      trend: "down",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analytics and business insights</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          const TrendIcon = report.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <Card key={report.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {report.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendIcon 
                    className={`h-3 w-3 ${
                      report.trend === "up" ? "text-green-600" : "text-red-600"
                    }`} 
                  />
                  <span className={report.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {report.change}
                  </span>
                  <span className="text-muted-foreground">from last week</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <Calendar className="mr-2 h-5 w-5" />
            Chart will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
