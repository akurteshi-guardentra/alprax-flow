// Helper function to group transactions by date
export function groupTransactionsByDate(transactions: any[]) {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const groups: { [key: string]: any[] } = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.created_at || transaction.timestamp);
    let groupKey = '';
    
    // Group by today, yesterday, this week, this month, etc.
    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else if (isSameWeek(date, new Date(), { weekStartsOn: 1 })) { // Week starts on Monday
      groupKey = 'This Week';
    } else if (isSameMonth(date, new Date())) {
      groupKey = 'This Month';
    } else if (isSameYear(date, new Date())) {
      groupKey = format(date, 'MMMM yyyy'); // e.g., "April 2025"
    } else {
      groupKey = format(date, 'yyyy'); // e.g., "2024"
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(transaction);
  });
  
  // Convert to array and sort groups
  return Object.entries(groups)
    .map(([title, items]) => ({
      title,
      data: items.sort((a, b) => {
        const dateA = new Date(a.created_at || a.timestamp).getTime();
        const dateB = new Date(b.created_at || b.timestamp).getTime();
        return dateB - dateA; // Sort by most recent first
      })
    }))
    .sort((a, b) => {
      // Custom order: Today, Yesterday, This Week, This Month, etc.
      const order = ['Today', 'Yesterday', 'This Week', 'This Month'];
      const indexA = order.indexOf(a.title);
      const indexB = order.indexOf(b.title);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      } else if (indexA !== -1) {
        return -1; // a is in the order array, b is not
      } else if (indexB !== -1) {
        return 1; // b is in the order array, a is not
      } else {
        // Both are not in the order array, sort by year/month (descending)
        return b.title.localeCompare(a.title);
      }
    });
}

// Imports needed from date-fns
import { format, isToday, isYesterday, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
