import type { NavigationItem } from "@/types";

import MenuItem from "./MenuItem";
import MegaMenu from "./Menu";

type Props = {
  page: NavigationItem;
};

export default function MenuMaker({ page }: Props) {
  const { children, title } = page;

  const hasChildren = children && children.length > 0;

  if (hasChildren) {
    return (
      <MegaMenu page={page}>
        {children.map((child) => (
          <MenuMaker page={child} key={`menu-maker-${title}`} />
        ))}
      </MegaMenu>
    );
  }

  return <MenuItem page={page} />;
}
