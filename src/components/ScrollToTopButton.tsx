
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton: React.FC = () => {
  return (
    <div className="mt-8 mb-16">
      <Button
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        className="flex items-center"
      >
        <ArrowUp className="mr-2 h-4 w-4" />
        Learn Something New
      </Button>
    </div>
  );
};

export default ScrollToTopButton;
