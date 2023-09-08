import type { NavigationItem } from "@/types";

import MenuItem from "./MenuItem";
import MegaMenu from "./Menu";
import { forwardRef } from "react";

type Props = {
  page: NavigationItem;
};

const MenuMaker = forwardRef<HTMLElement, Props>(function MenuMaker(
  { page, ...props },
  ref
) {
  const { children, title } = page;

  const hasChildren = children && children.length > 0;

  if (hasChildren) {
    return (
      <MegaMenu page={page} ref={ref} {...props}>
        {children.map((child) => (
          <MenuMaker
            page={child}
            // @ts-ignore
            ref={ref}
            {...props}
            key={`menu-maker-${title}`}
          />
        ))}
      </MegaMenu>
    );
  }

  return <MenuItem {...props} page={page} ref={ref} />;
});

export default MenuMaker;
