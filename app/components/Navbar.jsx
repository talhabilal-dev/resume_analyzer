"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const Navbar = () => {
    const { isSignedIn } = useAuth();
    const [credits, setCredits] = useState(null);

    useEffect(() => {
        if (!isSignedIn) return;
        fetch("/api/user/usage")
            .then((r) => r.json())
            .then((d) => { if (d.credits !== undefined) setCredits(d.credits); })
            .catch(() => {});
    }, [isSignedIn]);

    return (
        <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center">
                        <h1 className="text-2xl font-black bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent hover:scale-105 transition-transform">
                            RESUMIND
                        </h1>
                    </Link>
                    <div className="flex items-center gap-4">
                        {isSignedIn && (
                            <Link
                                href="/purchase"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all text-sm font-semibold"
                            >
                                <Zap className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                                {credits === null ? "…" : credits}
                                <span className="text-purple-400/70 font-normal">credits</span>
                            </Link>
                        )}
                        <Link
                            href="/usage"
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
                        >
                            Usage
                        </Link>
                        <Link
                            href="/upload"
                            className="px-6 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                        >
                            Upload Resume
                        </Link>
                        <div className="scale-110">
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-10 h-10 ring-2 ring-purple-500 ring-offset-2 ring-offset-black"
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;
