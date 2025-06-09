
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export function FinancialOverview() {
  const { transactions, isLoading } = useTransactions();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  const calculateTotals = (transactions: Transaction[] = []) => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount;
      } else if (transaction.type === 'expense') {
        acc.expenses += transaction.amount;
      }
      return acc;
    }, { income: 0, expenses: 0 });
  };

  const { income, expenses } = calculateTotals(transactions);
  const balance = income - expenses;

  return (
    <div className="grid gap-3 sm:gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-none shadow-lg bg-gradient-to-br from-violet-400/90 to-fuchsia-500/90 backdrop-blur-sm hover:from-violet-400 hover:to-fuchsia-500 transition-all duration-300 transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-200" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              ${income.toLocaleString()}
            </p>
            <p className="text-sm text-violet-200 mt-1">Available balance</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-400/90 to-orange-500/90 backdrop-blur-sm hover:from-amber-400 hover:to-orange-500 transition-all duration-300 transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-amber-200" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              ${expenses.toLocaleString()}
            </p>
            <p className="text-sm text-amber-200 mt-1">Total spent</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-none shadow-lg bg-gradient-to-br from-sky-400/90 to-indigo-500/90 backdrop-blur-sm hover:from-sky-400 hover:to-indigo-500 transition-all duration-300 transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-sky-200" />
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              ${balance.toLocaleString()}
            </p>
            <p className="text-sm text-sky-200 mt-1">Current balance</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
