import HomeClient from "@/components/HomeClient";

// No auth check — guests can use the app with localStorage
export default function Home() {
  return <HomeClient />;
}