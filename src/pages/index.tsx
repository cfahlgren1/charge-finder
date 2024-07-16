import { Inter } from "next/font/google";
import ChargingMap from "@/components/Map";
import DataModal from "@/components/DatasetsModal";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}
    >
      <ChargingMap />
      <div className="absolute bottom-5 right-5">
        <DataModal>
          <Button variant="secondary" className="rounded-lg flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white">
            <span>View Dataset</span>
          </Button>
        </DataModal>
      </div>
    </main>
  );
}