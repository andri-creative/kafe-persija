import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle, Tag, FileText } from "lucide-react";

interface ActionsNotivDeleteProps {
    trigger: React.ReactNode;
    name?: string;
    description?: string;
    onConfirm: () => void;
}

export function ActionsNotivDelete({
    trigger,
    name,
    description,
    onConfirm,
}: ActionsNotivDeleteProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[420px] border-none shadow-2xl bg-white dark:bg-zinc-950 p-0 overflow-hidden">
                {/* Header merah */}
                <div className="bg-linear-to-br from-rose-500 to-red-600 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm">
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <AlertDialogHeader className="text-left space-y-0.5">
                            <AlertDialogTitle className="text-white text-xl font-bold">
                                Confirm Delete
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-rose-100 text-sm">
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                </div>

                {/* Body — info item yang akan dihapus */}
                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete the following?
                    </p>

                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
                        {name && (
                            <div className="flex items-center gap-3 px-4 py-3">
                                <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Name</p>
                                    <p className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-100">{name}</p>
                                </div>
                            </div>
                        )}
                        {description && (
                            <div className="flex items-start gap-3 px-4 py-3">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Description</p>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">{description}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 text-rose-400" />
                        Deleted data cannot be recovered.
                    </p>
                </div>

                <AlertDialogFooter className="px-6 pb-5 flex gap-2">
                    <AlertDialogCancel className="flex-1 border-zinc-200 dark:border-zinc-800 cursor-pointer">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="flex-1 bg-linear-gradient-to-r cursor-pointer from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white border-none shadow-lg flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Yes, Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
