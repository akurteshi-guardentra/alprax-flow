
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransferTemplates } from "@/hooks/useTransferTemplates";
import { Calendar, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export function TransferTemplateList() {
  const { templates, isLoading, deleteTemplate, isDeleting } = useTransferTemplates();

  if (isLoading) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Transfer Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates?.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{template.name}</h3>
                  <p className="text-sm text-white/60">
                    To: {template.favorite_recipients.recipient_name}
                  </p>
                  <p className="text-sm text-white/60">
                    Amount: {template.currency} {template.amount.toLocaleString()}
                  </p>
                  {template.frequency !== "once" && (
                    <p className="text-sm text-white/60">
                      Frequency: {template.frequency} (Day: {template.scheduled_day})
                    </p>
                  )}
                  {template.next_transfer_date && (
                    <p className="text-sm text-white/60 flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Next: {format(new Date(template.next_transfer_date), "PPP")}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTemplate(template.id)}
                  disabled={isDeleting}
                  className="text-white/60 hover:text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}

          {(!templates || templates.length === 0) && (
            <div className="text-center text-white/60 py-8">
              No transfer templates found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
