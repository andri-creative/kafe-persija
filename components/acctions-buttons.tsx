import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { ActionsNotivDelete } from "@/components/acctions-notiv-delete";

type ButtonVariant = "outline" | "ghost" | "default" | "destructive" | "secondary" | "link";
type ButtonSize = "sm" | "default" | "xs" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
type ButtonType = "view" | "edit" | "delete";

interface ActionsButtonsProps {
    // Navigation (opsional — jika pakai URL)
    viewUrl?: string;
    editUrl?: string;
    // Callbacks (opsional — jika pakai handler)
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    // Data untuk dialog konfirmasi delete
    deleteName?: string;
    deleteDescription?: string;
    // Tampilan
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export default function ActionsButtons({
    viewUrl,
    editUrl,
    onView,
    onEdit,
    onDelete,
    deleteName,
    deleteDescription,
    showView = true,
    showEdit = true,
    showDelete = true,
    variant = "outline",
    size = "sm",
}: ActionsButtonsProps) {
    const getButtonClasses = (type: ButtonType) => {
        if (variant === "outline") {
            switch (type) {
                case "view":
                    return "border-blue-200 cursor-pointer text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:border-blue-700";
                case "edit":
                    return "border-amber-200 cursor-pointer text-amber-600 hover:bg-amber-50 hover:border-amber-300 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/50 dark:hover:border-amber-700";
                case "delete":
                    return "border-rose-200 cursor-pointer text-rose-600 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50 dark:hover:border-rose-700";
            }
        }
        return "";
    };

    const renderButton = (type: ButtonType, icon: React.ReactNode, tooltipText: string, url?: string, onClick?: () => void) => {
        const btn = (
            <Button
                variant={variant}
                size={size}
                onClick={onClick}
                className={`${getButtonClasses(type)} h-7 w-7 p-0`}
            >
                {icon}
                <span className="sr-only">{tooltipText}</span>
            </Button>
        );

        if (url) {
            return <Link href={url}>{btn}</Link>;
        }

        return btn;
    };

    // Tombol delete khusus — wrapped dengan AlertDialog konfirmasi
    const deleteBtn = (
        <Button
            variant={variant}
            size={size}
            className={`${getButtonClasses("delete")} h-7 w-7 p-0`}
        >
            <Trash2 className="h-2 w-2" />
            <span className="sr-only">Delete</span>
        </Button>
    );

    return (
        <TooltipProvider>
            <div className="flex items-center gap-1.5 justify-end">
                {/* View */}
                {showView && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {renderButton("view", <Eye className="h-2 w-2" />, "View", viewUrl, onView)}
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            <p>View</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Edit */}
                {showEdit && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {renderButton("edit", <Edit2 className="h-2 w-2" />, "Edit", editUrl, onEdit)}
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            <p>Edit</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Delete — dengan AlertDialog konfirmasi */}
                {showDelete && onDelete && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <ActionsNotivDelete
                                    trigger={deleteBtn}
                                    name={deleteName}
                                    description={deleteDescription}
                                    onConfirm={onDelete}
                                />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            <p>Delete</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
}