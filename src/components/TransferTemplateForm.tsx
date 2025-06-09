
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTransferTemplates } from "@/hooks/useTransferTemplates";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function TransferTemplateForm() {
  const { addTemplate, isAdding } = useTransferTemplates();
  const [name, setName] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [frequency, setFrequency] = useState<"once" | "weekly" | "monthly">("once");
  const [scheduledDay, setScheduledDay] = useState<number | undefined>();
  const [nextTransferDate, setNextTransferDate] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !recipientId || !amount || !currency) {
      toast.error("Please fill in all required fields");
      return;
    }

    const templateData = {
      name,
      recipient_id: recipientId,
      amount: parseFloat(amount),
      currency,
      frequency,
      scheduled_day: scheduledDay,
      next_transfer_date: nextTransferDate?.toISOString(),
    };

    addTemplate(templateData);
    
    // Reset form
    setName("");
    setRecipientId("");
    setAmount("");
    setCurrency("USD");
    setFrequency("once");
    setScheduledDay(undefined);
    setNextTransferDate(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
      <h3 className="text-lg font-semibold text-white">Create Transfer Template</h3>
      
      <div className="grid gap-4">
        <Input
          placeholder="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
        />

        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
        />

        <Select value={frequency} onValueChange={(value: "once" | "weekly" | "monthly") => setFrequency(value)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Transfer Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">One-time</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>

        {frequency !== "once" && (
          <Input
            type="number"
            min="1"
            max="31"
            placeholder={frequency === "weekly" ? "Day of week (1-7)" : "Day of month (1-31)"}
            value={scheduledDay || ""}
            onChange={(e) => setScheduledDay(parseInt(e.target.value))}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white",
                !nextTransferDate && "text-white/60"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {nextTransferDate ? format(nextTransferDate, "PPP") : "Select next transfer date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={nextTransferDate}
              onSelect={setNextTransferDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button 
          type="submit" 
          disabled={isAdding}
          className="w-full bg-gradient-to-r from-blue-500/80 to-blue-600/80 hover:from-blue-500/90 hover:to-blue-600/90 text-white"
        >
          {isAdding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Template"
          )}
        </Button>
      </div>
    </form>
  );
}
