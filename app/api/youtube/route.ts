import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const channelQuery = searchParams.get("channel");

    if (!channelQuery) {
        return NextResponse.json(
            { error: "Nama channel wajib diisi" },
            { status: 400 },
        );
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;

    try {
        // info channel
        const searchRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelQuery)}&key=${API_KEY}`,
        );
        const searchData = await searchRes.json();

        if (!searchData.items || searchData.items.length === 0) {
            return NextResponse.json(
                { error: "Channel YouTube tidak ditemukan" },
                { status: 404 },
            );
        }

        const channelId = searchData.items[0].id.channelId;

        // statistik channel dan playlist
        const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${API_KEY}`,
        );
        const channelData = await channelRes.json();
        const channelInfo = channelData.items[0];

        const uploadsPlaylistId =
            channelInfo.contentDetails.relatedPlaylists.uploads;

        // 5 video dari playlist uploads
        const playlistRes = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5&key=${API_KEY}`,
        );
        const playlistData = await playlistRes.json();

        const videoIds = playlistData.items
            .map((item: any) => item.snippet.resourceId.videoId)
            .join(",");

        // statistik video
        const videosRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`,
        );
        const videosData = await videosRes.json();

        const recentVideos = videosData.items.map((vid: any) => ({
            id: vid.id,
            title: vid.snippet.title,
            views: parseInt(vid.statistics.viewCount || "0", 10),
        }));

        return NextResponse.json({
            platform: "YouTube",
            accountName: channelInfo.snippet.title,
            profilePicture:
                channelInfo.snippet.thumbnails.default?.url ||
                channelInfo.snippet.thumbnails.medium?.url,
            totalViews: parseInt(channelInfo.statistics.viewCount || "0", 10),
            recentVideos: recentVideos,
        });
    } catch (error) {
        console.error("YouTube API Error:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data dari YouTube" },
            { status: 500 },
        );
    }
}
