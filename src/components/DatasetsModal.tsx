import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface DataModalProps {
    children: React.ReactNode;
}

export default function DataModal({ children }: DataModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[800px] bg-white p-0 overflow-hidden">
                {loading && (
                    <div className="flex justify-center items-center h-[560px]">
                        Loading the Dataset... <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                )}
                <iframe
                    src="https://huggingface.co/datasets/cfahlgren1/us-ev-charging-locations/embed/viewer/default/train"
                    width="100%"
                    height="560px"
                    onLoad={() => setLoading(false)}
                    style={{ display: loading ? 'none' : 'block' }}
                    className="border-0"
                ></iframe>
            </DialogContent>
        </Dialog>
    );
}