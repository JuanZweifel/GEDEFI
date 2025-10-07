import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

type DialogHandleProps<T> = {
    title: string;
    trigger: React.ReactNode;
    children: (close: () => void, initialData?: T) => React.ReactNode
    initialData?: T
    open?: boolean
    onOpenChange?: (open: boolean) => void
}
export function DialogHandle<T>({
    title,
    trigger,
    children,
    initialData,
    open: controlledOpen,
    onOpenChange,
}: DialogHandleProps<T>) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen
    const setOpen = isControlled ? onOpenChange! : setUncontrolledOpen

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="w-auto max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children(() => setOpen(false), initialData)}
            </DialogContent>
        </Dialog>
    )
}