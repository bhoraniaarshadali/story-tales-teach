
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  error: string;
  onTryAgain: () => void;
  onClearError: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onTryAgain, 
  onClearError 
}) => {
  return (
    <div className="mt-8 text-center p-6 bg-muted rounded-lg border border-border max-w-md">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
      <h3 className="text-xl font-semibold mb-2">Story Generation Failed</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <div className="flex gap-4 justify-center">
        <Button onClick={onTryAgain}>Try Again</Button>
        <Button variant="outline" onClick={onClearError}>
          Try Another Topic
        </Button>
      </div>
    </div>
  );
};

export default ErrorMessage;
