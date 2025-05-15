import { Card } from "@/components/ui/card";

export default function LoadingProfile() {
    return (
        <div className="container max-w-7xl mx-auto p-6">
            <div className="space-y-8">
                {/* Header Section Skeleton */}
                <div>
                    <div className="h-9 w-48 bg-gray-200 animate-pulse rounded-md" />
                    <div className="h-5 w-72 bg-gray-200 animate-pulse rounded-md mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Subscription Card Skeleton */}
                    <Card className="col-span-2 p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="h-8 w-40 bg-gray-200 animate-pulse rounded-md" />
                                <div className="h-5 w-56 bg-gray-200 animate-pulse rounded-md mt-1" />
                            </div>
                            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-md" />
                        </div>

                        {/* Current Plan Details Skeleton */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-md" />
                                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded-md" />
                                </div>
                                <div className="text-right">
                                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md" />
                                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-md mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Usage Stats Skeleton */}
                        <div className="space-y-4">
                            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-md" />
                            <div className="space-y-6">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between">
                                            <div className="h-4 w-40 bg-gray-200 animate-pulse rounded-md" />
                                            <div className="h-4 w-12 bg-gray-200 animate-pulse rounded-md" />
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 animate-pulse rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Quick Actions Skeleton */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <div className="h-6 w-40 bg-gray-200 animate-pulse rounded-md mb-4" />
                            <div className="space-y-3">
                                {[...Array(4)].map((_, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mr-2" />
                                        <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md" />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
