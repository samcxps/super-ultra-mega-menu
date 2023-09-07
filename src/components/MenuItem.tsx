import type { NavigationItem } from "@/types";

import Link from "next/link";

type Props = {
  page: NavigationItem;
};

export const menuItemClasses = "text-black";

export default function MenuItem({ page }: Props) {
  const { title } = page;

  return (
    <Link href="/" className={menuItemClasses}>
      {title}
    </Link>
  );
}
