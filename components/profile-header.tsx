"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Camera, Mail, MapPin, Loader2 } from "lucide-react";

export default function ProfileHeader() {
    const { data: session } = useSession();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUserData(data);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchUser();
        }
    }, [session]);

    if (loading) {
        return (
            <Card>
                <CardContent className="py-10 flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    const joinDate = userData?.created_at
        ? new Date(userData.created_at).toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })
        : "-";

    const role = userData?.user_role_trx?.[0]?.role?.name || "User";

    return (
        <Card>
            <CardContent>
                <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                    <div className="relative pt-6">
                        <Avatar className="h-24 w-24 border-2 border-primary/10">
                            <AvatarImage src={userData?.picture || ""} alt={userData?.nickname || "Profile"} />
                            <AvatarFallback className="text-2xl uppercase">
                                {userData?.nickname?.substring(0, 2) || "??"}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            size="icon"
                            variant="outline"
                            className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-background">
                            <Camera className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1 space-y-2 pt-6">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <h1 className="text-2xl font-bold">{userData?.nickname || session?.user?.nickname}</h1>
                            <Badge variant="secondary" className="w-fit uppercase text-[10px] font-bold">
                                {role}
                            </Badge>
                        </div>
                        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Mail className="size-4" />
                                {userData?.email || session?.user?.email}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="size-4" />
                                {userData?.type === "staff" ? "Cafe Staff" : "Persija Cafe"}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="size-4" />
                                Bergabung {joinDate}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
