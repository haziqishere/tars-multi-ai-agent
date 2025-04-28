"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

interface ImpactItem {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
}

interface NewsAndImpactSectionProps {
  newsItems: NewsItem[];
  impactItems: ImpactItem[];
}

const NewsAndImpactSection: React.FC<NewsAndImpactSectionProps> = ({
  newsItems,
  impactItems,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* News and Events Section */}
      <Card className="dashboard-card">
        <CardHeader className="pb-3 pt-4 border-b border-gray-100">
          <CardTitle className="text-base font-medium">
            Current News & Events
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="space-y-4">
            <ol className="list-decimal pl-5 space-y-3">
              {newsItems.map((item) => (
                <li key={item.id} className="text-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium">{item.title}</span>
                      <span className="text-gray-500 text-xs ml-2">
                        ({item.date})
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.impact === "positive"
                          ? "bg-green-50 text-green-700"
                          : item.impact === "negative"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {item.impact === "positive" && (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {item.impact === "negative" && (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {item.impact.charAt(0).toUpperCase() +
                        item.impact.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-xs mt-1">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Impact Analysis Section */}
      <Card className="dashboard-card">
        <CardHeader className="pb-3 pt-4 border-b border-gray-100">
          <CardTitle className="text-base font-medium">
            Future Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="space-y-4">
            <ol className="list-decimal pl-5 space-y-3">
              {impactItems.map((item) => (
                <li key={item.id} className="text-sm">
                  <div className="flex items-start justify-between">
                    <span className="font-medium">{item.title}</span>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 text-xs"
                      >
                        P: {(item.probability * 100).toFixed(0)}%
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 text-xs"
                      >
                        I: {item.impact.toFixed(1)}/5
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs mt-1">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsAndImpactSection;
