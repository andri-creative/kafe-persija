import { ArrowLeft, Loader2, Plus, Save } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface ButtonAddProps {
    addUrl: string;
    title: string;
    showText?: boolean;
    variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
    className?: string;
}

const DEFAULT_ADD_CLASS = "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg border-none transition-all hover:scale-105 active:scale-95 cursor-pointer";

const ButtonsComponentsAdd = ({ addUrl, title, showText = true, variant = "default", className }: ButtonAddProps) => {
    const mergedClass = `${DEFAULT_ADD_CLASS} ${className ?? ""}`.trim();

    return (
        <Link href={addUrl} className="inline-block">
            <Button
                variant={variant}
                size={showText ? "default" : "icon"}
                className={
                    showText
                        ? `gap-2 ${mergedClass}`
                        : `h-8 w-8 p-0 ${mergedClass}`
                }
            >
                <Plus className="h-4 w-4" />
                {showText
                    ? <span>Add {title}</span>
                    : <span className="sr-only text-sm">Add {title}</span>
                }
            </Button>
        </Link>
    );
};

interface ButtonBackProps {
    backUrl: string;
    title: string;
    showText?: boolean;
    variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
    className?: string;
}

const DEFAULT_BACK_CLASS = "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 cursor-pointer";

const ButtonsComponentsBack = ({ backUrl, title, showText = false, variant = "outline", className }: ButtonBackProps) => {
    const mergedClass = `${DEFAULT_BACK_CLASS} ${className ?? ""}`.trim();

    return (
        <Link href={backUrl} className="inline-block">
            <Button
                variant={variant}
                size={showText ? "default" : "icon"}
                className={
                    showText
                        ? `gap-2 ${mergedClass}`
                        : `h-8 w-8 p-0 ${mergedClass}`
                }
            >
                <ArrowLeft className="h-4 w-4" />
                {showText
                    ? <span>Back to {title}</span>
                    : <span className="sr-only">Back to {title}</span>
                }
            </Button>
        </Link>
    );
};

interface ButtonSaveProps {
    title?: string;
    showText?: boolean;
    variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
    className?: string;
    disabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
}

const DEFAULT_SAVE_CLASS = "bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-none transition-all hover:scale-105 active:scale-95 cursor-pointer";

const ButtonsComponentsSave = ({
    title = "Changes",
    showText = true,
    variant = "default",
    className,
    disabled = false,
    isLoading = false,
    onClick,
}: ButtonSaveProps) => {
    const mergedClass = `${DEFAULT_SAVE_CLASS} ${className ?? ""}`.trim();

    return (
        <Button
            type={onClick ? "button" : "submit"}
            onClick={onClick}
            variant={variant}
            size={showText ? "default" : "icon"}
            disabled={disabled || isLoading}
            className={
                showText
                    ? `gap-2 min-w-[120px] ${mergedClass}`
                    : `h-8 w-8 p-0 ${mergedClass}`
            }
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {showText && <span>Saving...</span>}
                </>
            ) : (
                <>
                    <Save className="h-4 w-4" />
                    {showText
                        ? <span>Save {title}</span>
                        : <span className="sr-only">Save {title}</span>
                    }
                </>
            )}
        </Button>
    );
};

export { ButtonsComponentsAdd, ButtonsComponentsBack, ButtonsComponentsSave };