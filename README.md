# Plataforma_GEDEFI

## Lista de pendientes Fase 2:

### general 
- definir colores de los botones -> Se dejo en azul de manera global (LUCHO)
- colocar timers en activar o desactivar -> solo se debe activar, se dejo el parametro timer en el componente (LUCHO)
- eliminar opciones de menú que no se ocupan
- colocar los trim a los form
- revisar refresh de dashboard por rutas 

### usuario
- cambiar el titulo de asociación 
- cambiar las iniciales de circulo al lado del nombre
- en el form de crear usuario eliminar en el select de club una de las 2 primeras opciones duplicadas
- crear roles automáticos
- revisar filtro pór nombre en usuario
- eliminar el tab de historial en usuario 

### club
- revisar permiso para desactivar club -> corregido
- warning RGB -> corregido
- 422 al modificar cualquier cosa (club activo) -> corregido
- como usuario de club no se puede ver el club (revisar) -> corregido
- verificar rut en otras tablas

### serie
- sacar el tab de historial de serie  -> corregido
- revisar iconos durante carga de serie y limpiar la lista  -> corregido
- paginado en serie 

### partido
- agregar barra de carga al agregar nuevo partido -> corregido
- revisar el tamaño formulario
- bloquear club duplicado
- revisar el crear partido (no envia id serie y horafin)
- controlar formulario con errores (cerrar)
- revisar algoritmo de calendario (hora en bloque)
- agregar filtro en partido 
- evaluar estado partido en curso 
- requerir hora fin al finalizar un partido 
- revisar si manejar o no el hora fin en partido 

### cancha 
- error al modificar una cancha (mandar el current user)
- poner un wrap en observación 

### finanzas
- verificar el cero a la izquierda -> corregido
- verificar tipo de orden -> corregido
- verificar monto -> corregido
- verificar el admin (cambiar a asociación) -> corregido
- no deja ver detalle de ordenes pagadas -> corregido
- agregar el filtro por tipo (enum)

### auditoria 
- arreglar el paginado
- quitar read
- arreglar id de registro (colocar rut completo)
- revisar las acciones (cards)

### fas
- agregar en fas que se puedan agregar otros fondos 
- blanquear el formulario de agregar uso fas
- controlar bien los errores 
- no debe dejar registrar uso a usuarios de club solo a admin
- poner editar y eliminar en los usos 
- quitar el ojito en los fondos 
- terminar rutas
- error muy genérico al tratar de crear un uso cuando no hay fondos 

### solicitud 
- ver si hay mas opciones de solicitudes 
- listar las solicitudes enviadas (por parte del usuario)
- cambiar admin -> asociación 
- agregar otro estado
- revisar cuando se envia a todos los usuarios  

### jugador
- revisar el eliminar jugador debería dejar borrar 
- colocar filtro por club
- limitar el mínimo de edad para crear un jugador

### lesión 
- revisar el botón el + es distinto 
- arreglar fecha lesión botón de desabilitar lesión
- revisar las validaciones a nivel de frontend  
- restringir la cantidad de semanas de recuperación
- ocultar botón de agregar lesión si es admin 

### ficha jugador
- revisar el eliminar ficha debería dejar eliminar ficha
- Enrutamiento

### entrenamiento 
- controlar horarios solo permitidos (entre 10 am y 23 hrs)
- no muestra los entrenamientos
- no se debe permitir colocar una hora anterior a la de inicio 
