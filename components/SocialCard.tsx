import React from "react";
import Image from "next/image";

export interface VideoData {
    id: string;
    title: string;
    views: number;
}

interface SocialCardProps {
    platform: "YouTube" | "TikTok" | "Instagram";
    accountName: string;
    profilePicture: string;
    totalViews: number;
    recentVideos: VideoData[];
    isLoading?: boolean;
    onRefresh?: () => void;
    errorMessage?: string;
}

export default function SocialCard({
    platform,
    accountName,
    profilePicture,
    totalViews,
    recentVideos,
    isLoading = false,
    onRefresh,
    errorMessage,
}: SocialCardProps) {
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded-full w-12 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="h-4 bg-gray-200 rounded w-full"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 flex flex-col items-center justify-center text-center h-full min-h-[300px] relative">
                <h3 className="absolute top-6 left-6 font-bold text-lg text-red-600">
                    {platform}
                </h3>
                <p className="text-red-600 font-medium">{errorMessage}</p>
            </div>
        );
    }

    if (!accountName) {
        return (
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 h-full min-h-[300px]">
                <p>Masukkan username {platform}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 relative">
            <div className="flex justify-between">
                <h3 className="font-bold text-lg mb-4 text-black">
                    {platform}
                </h3>
                <button
                    onClick={onRefresh}
                    className="text-gray-400 hover:text-blue-500 text-sm font-medium transition-colors cursor-pointer h-min"
                >
                    Refresh
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    {profilePicture ? (
                        <Image
                            src={profilePicture}
                            alt={accountName}
                            className="w-full h-full object-cover"
                            width={64}
                            height={64}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-300"></div>
                    )}
                </div>
                <div>
                    <h4 className="font-semibold text-xl text-gray-800">
                        {accountName}
                    </h4>
                    <p className="text-sm text-gray-500">
                        Total{" "}
                        {platform === "TikTok"
                            ? "Likes"
                            : platform === "Instagram"
                              ? "Followers"
                              : "Views"}
                        :{" "}
                        <strong className="text-gray-800">
                            {totalViews.toLocaleString()}
                        </strong>
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-600 mb-3 border-b pb-2">
                    5 Konten Terbaru
                </h5>
                <ul className="space-y-3">
                    {recentVideos.map((video) => (
                        <li
                            key={video.id}
                            className="flex justify-between items-start text-sm"
                        >
                            <span className="text-gray-700 line-clamp-2 pr-4">
                                {video.title}
                            </span>
                            <span className="font-medium text-gray-900 whitespace-nowrap bg-gray-100 px-2 py-1 rounded">
                                {video.views.toLocaleString()}
                            </span>
                        </li>
                    ))}

                    {recentVideos.length === 0 && (
                        <p className="text-sm text-gray-400 italic">
                            Tidak ada video yang ditemukan.
                        </p>
                    )}
                </ul>
            </div>
        </div>
    );
}
