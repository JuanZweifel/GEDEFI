import { Progress } from "./ui/progress"


export const Loading: React.FC<{ isLoading: number, component: string }> = ({ isLoading, component }) => {

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
            <p className="text-lg font-medium text-foreground">
                Cargando {component}...
            </p>
            <Progress value={isLoading} label="Cargando módulo" />
        </div>

    )
}