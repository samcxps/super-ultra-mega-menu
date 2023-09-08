import type { NavigationItem } from "@/types";

import Link from "next/link";
import { forwardRef } from "react";

type Props = {
  page: NavigationItem;
};

export const menuItemClasses = "text-black px-3 group";

const MenuItem = forwardRef<
  HTMLElement,
  Props & React.ButtonHTMLAttributes<HTMLElement>
>(function MenuItem({ page, ...props }, ref) {
  const { title } = page;

  return (
    <Link href="/" className={menuItemClasses}>
      <div className="relative">
        <span ref={ref} {...props}>
          {title}
        </span>
        <div className="hidden group-hover:block absolute bg-black h-0.5 w-full" />
      </div>
    </Link>
  );
});

export default MenuItem;
