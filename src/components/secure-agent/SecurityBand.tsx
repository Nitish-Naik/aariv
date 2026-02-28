export default function SecurityBand() {
    return (
        <section className="bg-zinc-100 text-zinc-900 py-16 lg:py-20 overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6 text-zinc-800">
                    Your credentials, quietly secured.
                </h2>
                <p className="text-lg lg:text-xl text-zinc-600 max-w-3xl mx-auto font-light leading-relaxed">
                    We don't need your passwords to help you. SecureAgent is rebuilt entirely from scratch with security as the absolute foundation, using pure OAuth and isolated sandboxing so your keys stay exactly where they belong.
                </p>
            </div>
        </section>
    );
}
