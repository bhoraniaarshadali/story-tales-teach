import React from "react";
import { FaLinkedin } from "react-icons/fa";

const PageFooter: React.FC = () => {
  return (
    <footer
      className="mt-12 sm:mt-20 w-full border-t border-muted px-2 sm:px-4 py-6 sm:py-8 text-center text-muted-foreground flex flex-col items-center gap-2 sm:gap-3"
      aria-label="Site Footer"
    >
      <p className="text-xs sm:text-sm md:text-base font-medium">
        © 2025 <span className="font-bold text-primary">Story Tales Teach</span> — Making learning memorable through Hinglish stories
      </p>
      <p className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm mt-1">
        This platform was created by
        <a
          href="https://www.linkedin.com/in/arshad-ali-bhorania/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary focus-visible:ring-2 focus-visible:ring-primary rounded transition-colors flex items-center gap-1"
          aria-label="Arshad ali Bhorania on LinkedIn"
        >
          <FaLinkedin className="inline-block text-blue-600" aria-hidden="true" />
          <strong>Arshad ali Bhorania</strong>
        </a>
        , who combined education and storytelling in a creative and magical way.
      </p>
    </footer>
  );
};

export default PageFooter;
