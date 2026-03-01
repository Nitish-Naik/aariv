import { Logo } from "./Logo";

export default function Footer() {
    return (
        <footer className="bg-zinc-950 py-12 text-center text-zinc-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2">
                <p>&copy; {new Date().getFullYear()} YourProxy. All rights reserved.</p>
                <div className="flex flex-col items-center justify-center gap-3 mt-1">
                    <p className="text-sm font-light">A quiet secure tool</p>
                    <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                        <Logo className="w-5 h-5 grayscale" />
                        <span className="text-sm font-semibold tracking-wide text-zinc-300">
                            YourProxy
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
