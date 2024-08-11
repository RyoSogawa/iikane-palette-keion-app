'use client';

import type React from 'react';
import { useRef, useEffect } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type SearchParamControllerProps = {
  paramsToRemove?: string[];
};

const SearchParamController: React.FC<SearchParamControllerProps> = ({ paramsToRemove }) => {
  const changed = useRef(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (changed.current || !paramsToRemove) return;
    const params = new URLSearchParams(searchParams.toString());

    paramsToRemove.forEach((paramToRemove) => {
      if (params.has(paramToRemove)) {
        params.delete(paramToRemove);
      }
    });

    router.replace(`${pathname}?${params.toString()}`);
    changed.current = true;
  }, [paramsToRemove, pathname, router, searchParams]);

  return null;
};

export default SearchParamController;
