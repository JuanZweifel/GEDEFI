from .reunion import ReunionBase, ReunionCreate, ReunionRead, ReunionUpdate
from .asociacion import AsociacionBase, AsociacionCreate, AsociacionRead, AsociacionUpdate
from .contrato_club import ContratoClubBase, ContratoClubCreate, ContratoClubRead, ContratoClubUpdate
from .serie import SerieBase, SerieCreate, SerieRead, SerieUpdate
from .estadistica_jugador import EstadisticaJugadorBase, EstadisticaJugadorCreate, EstadisticaJugadorRead, EstadisticaJugadorUpdate, EstadisticaJugadorWithDetails
#from .evaluacion_fisica import EvaluacionFisicaBase, EvaluacionFisicaCreate, EvaluacionFisicaRead, EvaluacionFisicaUpdate

__all__ = ["ReunionBase", "ReunionCreate", "ReunionRead", "ReunionUpdate", 
        "AsociacionBase", "AsociacionCreate", "AsociacionRead", "AsociacionUpdate",
        "ContratoClubBase", "ContratoClubCreate", "ContratoClubRead", "ContratoClubUpdate",
        "SerieBase", "SerieCreate", "SerieRead", "SerieUpdate",
        "EstadisticaJugadorBase", "EstadisticaJugadorCreate", "EstadisticaJugadorRead", "EstadisticaJugadorUpdate", "EstadisticaJugadorWithDetails"]
        #"EvaluacionFisicaBase", "EvaluacionFisicaCreate", "EvaluacionFisicaRead", "EvaluacionFisicaUpdate"]
