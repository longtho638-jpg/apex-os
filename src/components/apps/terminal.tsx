"use client";

import { useEffect, useRef, useState } from "react";

export function TerminalApp() {
    const [history, setHistory] = useState<string[]>([
        "Welcome to Apex OS Terminal v1.0.0",
        "Type 'help' for available commands.",
    ]);
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const handleCommand = (cmd: string) => {
        const args = cmd.trim().split(" ");
        const command = args[0].toLowerCase();

        let output = "";
        switch (command) {
            case "help":
                output = "Available commands: help, clear, status, agents, version";
                break;
            case "clear":
                setHistory([]);
                return;
            case "status":
                output = "System Status: ONLINE | Market: OPEN | Connection: SECURE";
                break;
            case "agents":
                output = "Active Agents: Collector (IDLE), Auditor (IDLE), Guardian (WATCHING)";
                break;
            case "version":
                output = "Apex OS v1.1.0";
                break;
            case "":
                break;
            default:
                output = `Command not found: ${command}`;
        }

        setHistory((prev) => [...prev, `$ ${cmd}`, output].filter(Boolean));
    };

    return (
        <div className="flex h-full w-full flex-col bg-black/90 p-4 font-mono text-sm text-green-400 backdrop-blur-md">
            <div className="flex-1 overflow-y-auto">
                {history.map((line, i) => (
                    <div key={i} className="mb-1 break-words">
                        {line}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCommand(input);
                    setInput("");
                }}
                className="mt-2 flex gap-2"
            >
                <span className="text-green-600">$</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                    autoFocus
                />
            </form>
        </div>
    );
}
