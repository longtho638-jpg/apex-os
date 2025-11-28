import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data for Admin Users
    return NextResponse.json([
        {
            id: "user_001",
            email: "alice@example.com",
            display_name: "Alice Trader",
            role: "admin",
            status: "active",
            joined_at: "2024-01-15T10:00:00Z",
            last_login: "2024-03-20T14:30:00Z"
        },
        {
            id: "user_002",
            email: "bob@example.com",
            display_name: "Bob Investor",
            role: "user",
            status: "active",
            joined_at: "2024-02-01T09:00:00Z",
            last_login: "2024-03-19T11:20:00Z"
        },
        {
            id: "user_003",
            email: "charlie@example.com",
            display_name: "Charlie Speculator",
            role: "user",
            status: "suspended",
            joined_at: "2024-02-15T16:45:00Z",
            last_login: "2024-03-10T08:15:00Z"
        },
        {
            id: "user_004",
            email: "david@example.com",
            display_name: "David HODLer",
            role: "user",
            status: "active",
            joined_at: "2024-03-01T12:00:00Z",
            last_login: "2024-03-21T09:30:00Z"
        },
        {
            id: "user_005",
            email: "eve@example.com",
            display_name: "Eve Hacker",
            role: "user",
            status: "banned",
            joined_at: "2024-03-05T18:20:00Z",
            last_login: "2024-03-06T10:10:00Z"
        }
    ]);
}
