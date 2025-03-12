import { AlertCircle, XCircle, AlertTriangle, InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorMessageProps {
  message: string;
  type?: "error" | "warning" | "info" | "success";
}

export function ErrorMessage({ message, type = "error" }: ErrorMessageProps) {
  const styles = {
    error: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
  };

  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: InfoIcon,
    success: AlertCircle,
  };

  const Icon = icons[type];

  return (
    <Alert className={`mb-4 ${styles[type]}`}>
      <Icon className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}