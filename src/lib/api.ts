const API_URL = "http://localhost:8000/api/v1";

export async function fetchWatchlist() {
    try {
        const res = await fetch(`${API_URL}/dashboard/watchlist`);
        if (!res.ok) throw new Error("Failed to fetch watchlist");
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function fetchPositions() {
    try {
        const res = await fetch(`${API_URL}/dashboard/positions`);
        if (!res.ok) throw new Error("Failed to fetch positions");
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function fetchSystemStatus() {
    try {
        const res = await fetch(`${API_URL}/system/status`);
        if (!res.ok) throw new Error("Failed to fetch status");
        return await res.json();
    } catch (error) {
        console.error(error);
        return { market: "OFFLINE", connection: "ERROR", agents_active: 0 };
    }
}
