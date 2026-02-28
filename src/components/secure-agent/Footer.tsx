import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-zinc-950 py-12 text-center text-zinc-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2">
                <p className="font-medium text-zinc-300">SecureAgent</p>
                <p className="text-sm font-light">
                    A quiet secure tool 
                    {/* by <Link href="#" className="underline decoration-zinc-800 hover:text-zinc-300 transition-colors">Aariv</Link> */}
                </p>
            </div>
        </footer>
    );
}
