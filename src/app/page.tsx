import Link from "next/link";

export default function Home() {
  return (
    <main className="p-24 flex flex-col gap-4">
      <Link href="/part-one">Part One</Link>
      <Link href="/part-two">Part Two</Link>
      <Link href="/part-three">Part Three</Link>
    </main>
  );
}
