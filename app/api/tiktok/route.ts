import { NextResponse } from "next/server";

// api scrapping bisa lambat, extend timeout default
export const maxDuration = 60;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let username = searchParams.get("username");

    if (!username) {
        return NextResponse.json(
            { error: "Username TikTok wajib diisi" },
            { status: 400 },
        );
    }

    username = username.replace("@", "");
    const API_TOKEN = process.env.APIFY_API_TOKEN;

    if (!API_TOKEN) {
        return NextResponse.json(
            { error: "Apify Token tidak ditemukan di .env" },
            { status: 500 },
        );
    }

    try {
        const apifyUrl = `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${API_TOKEN}`;

        const res = await fetch(apifyUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                profiles: [username],
                resultsPerPage: 5,
                shouldDownloadCovers: false,
                shouldDownloadVideos: false,
            }),
        });

        if (!res.ok) {
            throw new Error(`Apify merespons dengan status: ${res.status}`);
        }

        const items = await res.json();

        if (Array.isArray(items) && items.length > 0 && items[0].error) {
            console.warn("TikTok Scraper Info:", items[0].error);
            return NextResponse.json(
                {
                    error: "Username TikTok tidak ditemukan",
                },
                { status: 404 },
            );
        }

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "Akun TikTok tidak ditemukan atau tidak ada video" },
                { status: 404 },
            );
        }

        const authorInfo = items[0].authorMeta;

        const recentVideos = items.map((vid: any) => ({
            id: vid.id || Math.random().toString(),
            title: vid.text || "Video tanpa judul",
            views: parseInt(vid.playCount || "0", 10),
        }));

        return NextResponse.json({
            platform: "TikTok",
            accountName: authorInfo?.name || username,
            profilePicture: authorInfo?.avatar || "",
            totalViews: parseInt(
                authorInfo?.heart || authorInfo?.fans || "0",
                10,
            ),
            recentVideos: recentVideos,
        });
    } catch (error: any) {
        console.error("TikTok Fetch API Error:", error.message);
        return NextResponse.json(
            {
                error: "Gagal mengambil data dari TikTok",
                detail: error.message,
            },
            { status: 500 },
        );
    }
}
