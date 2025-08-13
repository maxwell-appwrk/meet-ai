"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoIcon, SparklesIcon, PlusIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const QuickActionCards = () => {
    const router = useRouter();

    return (
        <>
            <Card className="relative overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <VideoIcon className="size-5" />
                        New Meeting
                    </CardTitle>
                    <CardDescription>
                        Start a meeting with an AI agent
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        className="w-full" 
                        onClick={() => router.push("/meetings?new=true")}
                    >
                        <PlusIcon className="size-4 mr-2" />
                        Create Meeting
                    </Button>
                </CardContent>
                <div className="absolute -bottom-6 -right-6 size-24 bg-primary/10 rounded-full blur-2xl" />
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SparklesIcon className="size-5" />
                        AI Agents
                    </CardTitle>
                    <CardDescription>
                        Configure your meeting assistants
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push("/agents")}
                    >
                        Manage Agents
                        <ArrowRightIcon className="size-4 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        </>
    );
};