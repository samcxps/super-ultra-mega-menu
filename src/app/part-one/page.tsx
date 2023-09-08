import { NAVIGATION_DATA } from "@/data";

import MenuMaker from "./components/MenuMaker";

export default function Home() {
  return (
    <main className="p-24">
      <nav className="space-x-12 py-4">
        {NAVIGATION_DATA.map((l1, idx) => (
          <MenuMaker page={l1} key={`menu-maker-${idx}`} />
        ))}
      </nav>
    </main>
  );
}
