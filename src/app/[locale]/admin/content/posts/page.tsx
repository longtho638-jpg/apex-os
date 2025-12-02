'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, MoreVertical } from 'lucide-react';

export default function PostsPage() {
    return (
        <div className="p-6 space-y-6 bg-[#030303] min-h-screen text-white">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">All Posts</h1>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input placeholder="Search posts..." className="pl-9 bg-zinc-900 border-zinc-800 w-64" />
                    </div>
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                </div>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <div className="p-12 text-center text-zinc-500">
                    <p>Post management list will go here.</p>
                    <p className="text-sm mt-2">(This is a placeholder for the full CRUD interface)</p>
                </div>
            </Card>
        </div>
    );
}
