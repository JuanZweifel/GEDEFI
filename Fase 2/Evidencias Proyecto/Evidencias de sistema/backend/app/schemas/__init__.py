from .reunion import ReunionBase, ReunionCreate, ReunionRead, ReunionUpdate
from .asociacion import AsociacionBase, AsociacionCreate, AsociacionRead, AsociacionUpdate
from .contrato_club import ContratoClubBase, ContratoClubCreate, ContratoClubRead, ContratoClubUpdate
from .serie import SerieBase, SerieCreate, SerieRead, SerieUpdate
from .estadistica_jugador import EstadisticaJugadorBase, EstadisticaJugadorCreate, EstadisticaJugadorRead, EstadisticaJugadorUpdate, EstadisticaJugadorWithDetails
#from .evaluacion_fisica import EvaluacionFisicaBase, EvaluacionFisicaCreate, EvaluacionFisicaRead, EvaluacionFisicaUpdate
from .ficha_jugador import FichaJugadorBase, FichaJugadorCreate, FichaJugadorRead, FichaJugadorUpdate
from .pais import PaisBase, PaisCreate, PaisRead, PaisUpdate

__all__ = ["ReunionBase", "ReunionCreate", "ReunionRead", "ReunionUpdate", 
        "AsociacionBase", "AsociacionCreate", "AsociacionRead", "AsociacionUpdate",
        "ContratoClubBase", "ContratoClubCreate", "ContratoClubRead", "ContratoClubUpdate",
        "SerieBase", "SerieCreate", "SerieRead", "SerieUpdate",
        "EstadisticaJugadorBase", "EstadisticaJugadorCreate", "EstadisticaJugadorRead", "EstadisticaJugadorUpdate", "EstadisticaJugadorWithDetails",
        "FichaJugadorBase", "FichaJugadorCreate", "FichaJugadorRead", "FichaJugadorUpdate",
        "PaisBase", "PaisCreate", "PaisRead", "PaisUpdate"]
        #"EvaluacionFisicaBase", "EvaluacionFisicaCreate", "EvaluacionFisicaRead", "EvaluacionFisicaUpdate"]
