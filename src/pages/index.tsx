import { Inter } from "next/font/google";
import ChargingMap from "@/components/Map";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}
    >
      <ChargingMap />
    </main>
  );
}
