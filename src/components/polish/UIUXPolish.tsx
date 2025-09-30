import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Sparkles, Eye, Loader2, AlertTriangle } from 'lucide-react';

interface PolishItem {
  id: string;
  category: string;
  item: string;
  status: 'completed' | 'in_progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
}

export const UIUXPolish = () => {
  const polishItems: PolishItem[] = [
    {
      id: '1',
      category: 'Visual Hierarchy',
      item: 'Consistent typography scale across all pages',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '2',
      category: 'Visual Hierarchy',
      item: 'Clear call-to-action button hierarchy',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '3',
      category: 'Interactions',
      item: 'Smooth micro-interactions and transitions',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: '4',
      category: 'Interactions',
      item: 'Hover states for all interactive elements',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '5',
      category: 'Loading States',
      item: 'Skeleton loaders for data fetching',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '6',
      category: 'Loading States',
      item: 'Progress indicators for long operations',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '7',
      category: 'Empty States',
      item: 'Meaningful empty state designs with CTAs',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: '8',
      category: 'Error States',
      item: 'User-friendly error messages',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '9',
      category: 'Accessibility',
      item: 'ARIA labels for screen readers',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '10',
      category: 'Accessibility',
      item: 'Keyboard navigation support',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '11',
      category: 'Responsiveness',
      item: 'Mobile-first responsive design',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '12',
      category: 'Responsiveness',
      item: 'Touch-friendly tap targets (min 44px)',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '13',
      category: 'Visual Feedback',
      item: 'Toast notifications for user actions',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '14',
      category: 'Visual Feedback',
      item: 'Form validation feedback',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '15',
      category: 'Performance',
      item: 'Optimized images and lazy loading',
      status: 'completed',
      priority: 'medium'
    }
  ];

  const getStatusIcon = (status: PolishItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: PolishItem['priority']) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;
    return variants[priority];
  };

  const groupedItems = polishItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PolishItem[]>);

  const completedCount = polishItems.filter(i => i.status === 'completed').length;
  const totalCount = polishItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                UI/UX Polish Checklist
              </CardTitle>
              <CardDescription>
                Final polish for production-ready user experience
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} completed
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <span className="text-sm">{item.item}</span>
                    </div>
                    <Badge variant={getPriorityBadge(item.priority)} className="text-xs">
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
