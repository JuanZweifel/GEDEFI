import * as React from 'react';
import {
    AlertDialog,
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
    open: boolean;
    onOpenChange: (open: boolean) => void
    onConfirm: () => void | Promise<void>; // lo que se ejecuta al aceptar
}
export const AlertDialogHandle: React.FC<AlertDialogHandleProps> = ({
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    open,
    onOpenChange,
    onConfirm,
}) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction onClick={async(e) => {e.preventDefault(); await onConfirm(); console.log(open)}}>
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