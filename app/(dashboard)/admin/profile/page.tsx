import ProfileContent from "@/components/profile-content";
import ProfileHeader from "@/components/profile-header";

export default function ProfilePage() {
    return (
        <>
            <div className="space-y-6 px-4 py-10">
                <ProfileHeader />
                <ProfileContent />
            </div>

        </>
    );
}