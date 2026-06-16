import { useMemo, useState } from "react";

export const usePagination = (data= [], itemsPerPage = 12) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [currentPage, data, itemsPerPage]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (page) => {
    const boundedPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(boundedPage);
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    nextPage,
    previousPage,
    goToPage,
  };
};

export default usePagination;
