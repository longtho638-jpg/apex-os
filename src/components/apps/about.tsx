export function About() {
    return (
        <div className="h-full w-full bg-[#050505] p-8 text-white selection:bg-white/20">
            <div className="mx-auto max-w-2xl space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter">Apex OS</h1>
                    <p className="text-lg text-gray-400">The Agentic Financial Operating System</p>
                </div>

                <div className="grid gap-4 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
                    <div className="flex justify-between border-b border-[#262626] pb-4">
                        <span className="text-gray-500">Version</span>
                        <span className="font-mono">1.1.0 (Gemini 3.0 Updated)</span>
                    </div>
                    <div className="flex justify-between border-b border-[#262626] pb-4">
                        <span className="text-gray-500">Core</span>
                        <span className="font-mono">Next.js 14 + FastAPI</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Agents</span>
                        <span className="font-mono text-green-500">Active (The Wolf Pack)</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Credits</h3>
                    <p className="text-gray-400">
                        Designed for professional traders who demand transparency, automation, and institutional-grade tools.
                    </p>
                </div>
            </div>
        </div>
    );
}
