import * as React from 'react';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "./ui/alert-dialog.tsx";

type AlertDialogHandleProps = {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    children: React.ReactNode;
    onConfirm: () => void | Promise<void>; // lo que se ejecuta al aceptar
}
export const AlertDialogHandle: React.FC<AlertDialogHandleProps> = ({
    title,
    description,
    confirmLabel,
    cancelLabel,
    children,
    onConfirm,
}) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

/*<Button variant="destructive" size="sm" className="flex-1" onClick={(e) => handleDelete(club.id_club)}>
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Eliminar
                                            </Button>*/