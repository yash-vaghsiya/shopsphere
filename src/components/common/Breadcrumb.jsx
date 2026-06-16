import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";



export const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex mb-6 py-1.5" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Home size={14} className="mr-1.5" />
            Home
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center">
              <ChevronRight size={14} className="text-gray-400 mx-1 md:mx-2" />
              {isLast ? (
                <span className="text-gray-800 dark:text-gray-300 font-semibold truncate max-w-[120px] md:max-w-[240px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
