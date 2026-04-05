"use client";

import { useState } from "react";
import SocialCard, { VideoData } from "../components/SocialCard";

export default function Dashboard() {
    const [inputs, setInputs] = useState({
        youtube: "",
        tiktok: "",
        instagram: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const [isRefreshing, setIsRefreshing] = useState({
        youtube: false,
        tiktok: false,
        instagram: false,
    });

    const [socialData, setSocialData] = useState<any>({
        youtube: null,
        tiktok: null,
        instagram: null,
    });

    const fetchYouTube = async (channelName: string) => {
        if (!channelName) return null;
        try {
            const res = await fetch(
                `/api/youtube?channel=${encodeURIComponent(channelName)}`,
            );
            const data = await res.json();
            if (!res.ok)
                return {
                    error: data.error || "Channel YouTube tidak ditemukan",
                };
            return data;
        } catch (err) {
            return { error: "Gagal terhubung ke server YouTube" };
        }
    };

    const fetchTikTok = async (username: string) => {
        if (!username) return null;
        try {
            const res = await fetch(
                `/api/tiktok?username=${encodeURIComponent(username)}`,
            );
            const data = await res.json();
            if (!res.ok)
                return {
                    error: data.error || "Username TikTok tidak ditemukan",
                };
            return data;
        } catch (err) {
            return { error: "Gagal terhubung ke server TikTok" };
        }
    };

    const fetchInstagram = async (username: string) => {
        if (!username) return null;
        try {
            const res = await fetch(
                `/api/instagram?username=${encodeURIComponent(username)}`,
            );
            const data = await res.json();
            if (!res.ok)
                return {
                    error: data.error || "Username Instagram tidak ditemukan",
                };
            return data;
        } catch (err) {
            return { error: "Gagal terhubung ke server Instagram" };
        }
    };

    const handleRefresh = async (
        platform: "youtube" | "tiktok" | "instagram",
        username: string,
    ) => {
        if (!username) return;

        setIsRefreshing((prev) => ({ ...prev, [platform]: true }));

        try {
            let res: any;
            if (platform === "youtube") res = await fetchYouTube(username);
            if (platform === "tiktok") res = await fetchTikTok(username);
            if (platform === "instagram") res = await fetchInstagram(username);

            setSocialData((prev: any) => ({
                ...prev,
                [platform]: res,
            }));
        } catch (error) {
            console.error(`Gagal refresh ${platform}:`, error);
        } finally {
            setIsRefreshing((prev) => ({ ...prev, [platform]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const [ytData, tkData, igData] = await Promise.all([
                fetchYouTube(inputs.youtube),
                fetchTikTok(inputs.tiktok),
                fetchInstagram(inputs.instagram),
            ]);

            setSocialData({
                youtube: ytData,
                tiktok: tkData,
                instagram: igData,
            });
        } catch (error) {
            console.error("Kesalahan sistem:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Technical Test - Vinson
                    </h1>
                </div>

                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col md:flex-row gap-4 items-end"
                    >
                        <div className="flex-1 w-full space-y-2">
                            <label
                                htmlFor="youtube"
                                className="block text-sm font-medium text-gray-700"
                            >
                                YouTube Channel
                            </label>
                            <input
                                id="youtube"
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition text-black"
                                value={inputs.youtube}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        youtube: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="flex-1 w-full space-y-2">
                            <label
                                htmlFor="tiktok"
                                className="block text-sm font-medium text-gray-700"
                            >
                                TikTok Username
                            </label>
                            <input
                                id="tiktok"
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition text-black"
                                value={inputs.tiktok}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        tiktok: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="flex-1 w-full space-y-2">
                            <label
                                htmlFor="instagram"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Instagram Username
                            </label>
                            <input
                                id="instagram"
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition text-black"
                                value={inputs.instagram}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        instagram: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-300 h-[50px]"
                        >
                            {isLoading ? "Mencari..." : "Lacak Data"}
                        </button>
                    </form>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SocialCard
                        platform="YouTube"
                        isLoading={isLoading || isRefreshing.youtube}
                        accountName={socialData.youtube?.accountName || ""}
                        profilePicture={
                            socialData.youtube?.profilePicture || ""
                        }
                        totalViews={socialData.youtube?.totalViews || 0}
                        recentVideos={socialData.youtube?.recentVideos || []}
                        errorMessage={socialData.youtube?.error}
                        onRefresh={() =>
                            handleRefresh("youtube", inputs.youtube)
                        }
                    />
                    <SocialCard
                        platform="TikTok"
                        isLoading={isLoading || isRefreshing.tiktok}
                        accountName={socialData.tiktok?.accountName || ""}
                        profilePicture={socialData.tiktok?.profilePicture || ""}
                        totalViews={socialData.tiktok?.totalViews || 0}
                        recentVideos={socialData.tiktok?.recentVideos || []}
                        errorMessage={socialData.tiktok?.error}
                        onRefresh={() => handleRefresh("tiktok", inputs.tiktok)}
                    />
                    <SocialCard
                        platform="Instagram"
                        isLoading={isLoading || isRefreshing.instagram}
                        accountName={socialData.instagram?.accountName || ""}
                        profilePicture={
                            socialData.instagram?.profilePicture || ""
                        }
                        totalViews={socialData.instagram?.totalViews || 0}
                        recentVideos={socialData.instagram?.recentVideos || []}
                        errorMessage={socialData.instagram?.error}
                        onRefresh={() =>
                            handleRefresh("instagram", inputs.instagram)
                        }
                    />
                </section>
            </div>
        </main>
    );
}
