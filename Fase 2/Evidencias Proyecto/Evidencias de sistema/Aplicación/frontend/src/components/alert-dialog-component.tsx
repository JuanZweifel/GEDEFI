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
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    confirmDisabled?: boolean;
    /** ⏳ Si se pasa un número, activa el temporizador (en segundos) antes de habilitar el botón */
    timer?: number;
};

export const AlertDialogHandle: React.FC<AlertDialogHandleProps> = ({
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    open,
    onOpenChange,
    onConfirm,
    confirmDisabled = false,
    timer,
}) => {
    const [countdown, setCountdown] = React.useState<number>(0);

    // Si se pasa un timer, empieza el conteo cuando se abre el diálogo
    React.useEffect(() => {
        if (timer && open) {
            setCountdown(timer);
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else if (!open) {
            setCountdown(0);
        }
    }, [open, timer]);

    const isDisabled = confirmDisabled || countdown > 0;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>
                        {cancelLabel}
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={async (e) => {
                            e.preventDefault();
                            if (!isDisabled) await onConfirm();
                        }}
                        disabled={isDisabled}
                        className={isDisabled ? "opacity-60 cursor-not-allowed" : ""}
                    >
                        {countdown > 0
                            ? `${confirmLabel} (${countdown})`
                            : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
