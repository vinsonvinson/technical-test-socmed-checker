import { NextResponse } from "next/server";

// api scrapping bisa lambat, extend timeout default
export const maxDuration = 60;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let username = searchParams.get("username");

    if (!username) {
        return NextResponse.json(
            { error: "Username Instagram wajib diisi" },
            { status: 400 },
        );
    }

    username = username.replace("@", "");
    const API_TOKEN = process.env.APIFY_API_TOKEN;

    if (!API_TOKEN) {
        return NextResponse.json(
            { error: "Apify Token tidak ditemukan" },
            { status: 500 },
        );
    }

    try {
        const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${API_TOKEN}`;

        const res = await fetch(apifyUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                directUrls: [`https://www.instagram.com/${username}/`],
                resultsLimit: 5,
                resultsType: "details",
                addParentData: false,
                searchLimit: 1,
                searchType: "user",
            }),
        });

        if (!res.ok) {
            throw new Error(`Apify merespons dengan status: ${res.status}`);
        }

        const items = await res.json();

        if (
            Array.isArray(items) &&
            items.length > 0 &&
            items[0].error === "not_found"
        ) {
            console.warn("Instagram Scraper Info:", items[0].errorDescription);
            return NextResponse.json(
                {
                    error: "Username Instagram tidak ditemukan",
                },
                { status: 404 },
            );
        }

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "Akun Instagram tidak ditemukan" },
                { status: 404 },
            );
        }

        const userData = items[0];

        // urutkan semua konten (posts + IGTV) berdasarkan timestamp terbaru, lalu ambil 5 teratas
        const rawPosts = userData.latestPosts || [];
        const rawIgtv = userData.latestIgtvVideos || [];

        const allContent = [...rawPosts, ...rawIgtv];

        allContent.sort((a: any, b: any) => {
            const dateA = new Date(a.timestamp || 0).getTime();
            const dateB = new Date(b.timestamp || 0).getTime();
            return dateB - dateA;
        });

        const recentVideos = allContent.slice(0, 5).map((post: any) => ({
            id: post.id || post.shortCode || Math.random().toString(),
            title:
                post.caption || post.title || post.alt || "Post tanpa caption",
            views: parseInt(post.videoViewCount || post.likesCount || "0", 10),
        }));

        return NextResponse.json({
            platform: "Instagram",
            accountName: userData.fullName || userData.username || username,
            profilePicture:
                userData.profilePicUrlHD || userData.profilePicUrl || "",
            totalViews: parseInt(userData.followersCount || "0", 10),
            recentVideos: recentVideos,
        });
    } catch (error: any) {
        console.error("Instagram Fetch API Error:", error.message);
        return NextResponse.json(
            {
                error: "Gagal mengambil data dari Instagram",
                detail: error.message,
            },
            { status: 500 },
        );
    }
}
