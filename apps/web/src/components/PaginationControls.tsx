"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@tcg/ui";

export function PaginationControls({
  basePath,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Pagination
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={(nextPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(nextPage));
        router.push(`${basePath}?${params.toString()}`);
      }}
    />
  );
}
