import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface ChartData {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

export function randomChartGenerator(): ChartData {
  const templates = [
    {
      categories: ["first Q", "second Q", "third Q", "fourth Q"],
      series: [
        {
          name: "Revenue 2023",
          data: [32500, 47800, 41500, 59000]
        },
        {
          name: "Revenue 2022",
          data: [28000, 35000, 37500, 41000]
        }
      ]
    },
    {
      categories: ["Mobile", "Desktop", "Tablet", "Other"],
      series: [
        {
          name: "Active Users",
          data: [85000, 65000, 22000, 95000]
        },
        {
          name: "Last Month",
          data: [72000, 58000, 18000, 85000]
        }
      ]
    },
    {
      categories: ["Product A", "Product B", "Product C", "Product D"],
      series: [
        {
          name: "Sales Volume",
          data: [1200, 980, 850, 674]
        },
        {
          name: "Target",
          data: [1000, 800, 900, 700]
        }
      ]
    }
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}