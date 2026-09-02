# Plataforma de Eventos e Inscripciones - Preentrega 6

Backend desarrollado con Node.js, Express y MongoDB para una plataforma de eventos e inscripciones.

En esta preentrega se completa la entidad `Event` y se incorpora la lógica de negocio necesaria para crear, consultar, actualizar y cancelar eventos.

También se implementan filtros, paginación, ordenamiento, control de acceso por roles y validación de propiedad de los eventos.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Passport.js
- JWT
- bcrypt
- cookie-parser
- dotenv
- nodemon

## Instalación

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` tomando como referencia `.env.example`:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1h
```

Iniciar el proyecto en modo desarrollo:

```bash
npm run dev
```

Por defecto, el servidor se ejecuta en:

```text
http://localhost:8080
```

---

# Modelo Event

Los eventos se almacenan en MongoDB utilizando el modelo `Event`.

Campos principales:

| Campo | Tipo | Descripción |
|---|---|---|
| `title` | String | Título del evento |
| `description` | String | Descripción |
| `category` | String | Categoría |
| `date` | Date | Fecha del evento |
| `location` | String | Ubicación |
| `capacity` | Number | Capacidad máxima |
| `price` | Number | Precio |
| `status` | String | Estado actual |
| `organizer` | ObjectId | Referencia al usuario organizador |

El campo `organizer` es una referencia al modelo `User` y no almacena el objeto completo del usuario.

```js
organizer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}
```

## Estados de un evento

Los estados permitidos son:

```text
draft
published
cancelled
finished
```

Un evento nuevo utiliza `draft` como estado por defecto si no se especifica otro estado válido.

---

# Roles y permisos

El sistema utiliza tres roles:

### user

Usuario común de la plataforma.

Puede consultar eventos públicos, pero no puede crear ni modificar eventos.

### organizer

Puede crear eventos y modificar los eventos que le pertenecen.

No puede modificar eventos creados por otros organizadores.

### admin

Puede crear eventos y modificar cualquier evento, independientemente del organizador que lo haya creado.

También posee acceso a las funcionalidades administrativas implementadas previamente.

## Matriz de permisos

| Acción | user | organizer | admin |
|---|---|---|---|
| Listar eventos | Sí | Sí | Sí |
| Consultar evento por ID | Sí | Sí | Sí |
| Crear eventos | No | Sí | Sí |
| Modificar evento propio | No | Sí | Sí |
| Modificar evento ajeno | No | No | Sí |
| Cambiar estado propio | No | Sí | Sí |
| Cambiar estado ajeno | No | No | Sí |

---

# Endpoints de eventos

## Crear evento

```http
POST /api/events
```

Acceso:

```text
organizer
admin
```

Ejemplo:

```json
{
  "title": "Workshop Node 2026",
  "description": "Taller práctico de Node.js y Express",
  "category": "workshop",
  "date": "2026-10-20T18:00:00.000Z",
  "location": "Buenos Aires",
  "capacity": 50,
  "price": 15000,
  "status": "published"
}
```

El campo `organizer` no debe enviarse desde el cliente.

El servidor obtiene automáticamente el usuario autenticado y asigna:

```js
organizer: req.user.id
```

De esta forma, un usuario no puede crear un evento a nombre de otro organizador.

Una creación correcta devuelve HTTP `201`.

---

## Listar eventos

```http
GET /api/events
```

La ruta es pública.

El listado utiliza paginación y permite aplicar diferentes filtros.

Ejemplo:

```http
GET /api/events?status=published&category=workshop&page=1&limit=5&sort=date
```

La respuesta posee la siguiente estructura:

```json
{
  "status": "success",
  "data": [],
  "page": 1,
  "limit": 5,
  "total": 0,
  "totalPages": 0
}
```

---

# Filtros disponibles

## Estado

```text
?status=published
```

Los estados válidos son:

```text
draft
published
cancelled
finished
```

## Categoría

```text
?category=workshop
```

## Ubicación

```text
?location=Buenos Aires
```

## Rango de fechas

Se puede filtrar utilizando `dateFrom` y `dateTo`.

Ejemplo:

```text
?dateFrom=2026-10-01&dateTo=2026-12-31
```

También pueden utilizarse de forma independiente.

---

# Paginación

El listado acepta:

```text
page
limit
```

Ejemplo:

```text
?page=2&limit=5
```

La respuesta incluye:

```text
data
page
limit
total
totalPages
```

El valor por defecto de `page` es `1` y el valor por defecto de `limit` es `10`.

---

# Ordenamiento

El parámetro:

```text
sort
```

permite ordenar los resultados.

Por ejemplo, para ordenar por fecha de manera ascendente:

```text
?sort=date
```

Para ordenar de manera descendente:

```text
?sort=-date
```

Los filtros, la paginación y el ordenamiento pueden combinarse:

```text
/api/events?status=published&category=workshop&page=1&limit=5&sort=date
```

---

# Consultar evento por ID

```http
GET /api/events/:id
```

La ruta es pública.

Si el evento existe, devuelve HTTP `200`.

Si no existe, devuelve HTTP `404`:

```json
{
  "status": "error",
  "message": "Evento no encontrado"
}
```

---

# Modificar evento

```http
PUT /api/events/:id
```

Acceso:

```text
organizer propietario
admin
```

Un organizador solamente puede modificar los eventos que creó.

Si intenta modificar un evento perteneciente a otro organizador, el servidor devuelve HTTP `403`:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

Un administrador puede modificar eventos pertenecientes a cualquier organizador.

El campo `organizer` no puede modificarse mediante este endpoint.

El estado tampoco se modifica mediante el `PUT` general, ya que existe un endpoint específico para cambios de estado.

---

# Cambiar estado de un evento

```http
PATCH /api/events/:id/status
```

Acceso:

```text
organizer propietario
admin
```

Ejemplo:

```json
{
  "status": "cancelled"
}
```

Cancelar un evento no lo elimina de MongoDB.

En su lugar, cambia su estado a:

```text
cancelled
```

Esto permite conservar el registro y la información histórica del evento.

---

# Reglas de negocio

La lógica de negocio relacionada con eventos se encuentra en la capa `services`.

## Fecha del evento

No se permite crear un evento con una fecha pasada.

En ese caso se devuelve HTTP `400`:

```json
{
  "status": "error",
  "message": "La fecha del evento debe ser futura"
}
```

## Capacidad

La capacidad debe ser mayor a `0`.

Por ejemplo:

```json
{
  "capacity": 0
}
```

produce HTTP `400`.

## Precio

El precio debe ser mayor o igual a `0`.

Los eventos gratuitos pueden utilizar:

```json
{
  "price": 0
}
```

Los precios negativos son rechazados.

## Eventos cancelados

Un evento cuyo estado sea:

```text
cancelled
```

no puede seguir modificándose.

Tampoco puede volver a cambiarse su estado.

Por ejemplo, intentar cambiar un evento cancelado nuevamente a `published` produce un error de validación.

## Eventos finalizados

Un evento con estado:

```text
finished
```

no puede volver a publicarse.

## Ownership

Cada evento guarda el ID del usuario que lo creó mediante:

```text
organizer
```

Cuando un organizador intenta modificar un evento, el sistema compara el organizador almacenado con:

```js
req.user.id
```

Si los identificadores no coinciden, la operación devuelve HTTP `403`.

Los administradores pueden modificar eventos de cualquier organizador.

---

# Autenticación y autorización

La autenticación utiliza JWT almacenado en una cookie `httpOnly`.

Las rutas protegidas utilizan los middlewares:

```text
auth.middleware.js
authorize.middleware.js
```

`auth` verifica que exista una sesión válida y almacena la información del usuario autenticado en:

```js
req.user
```

`authorize` comprueba que el usuario tenga uno de los roles permitidos para ejecutar la operación.

---

# Códigos 401 y 403

El proyecto diferencia autenticación de autorización.

## 401 - No autenticado

Se devuelve cuando no existe una sesión válida.

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

## 403 - Sin permisos

Se devuelve cuando existe una sesión válida, pero el usuario no tiene permisos suficientes.

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

---

# Arquitectura

El proyecto mantiene una separación por capas.

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
DAO
   ↓
MongoDB
```

## Routes

Definen los endpoints y aplican los middlewares correspondientes.

## Controllers

Se encargan de recibir las peticiones HTTP y construir las respuestas.

No contienen las reglas de negocio de eventos.

## Services

Contienen las reglas de negocio:

- validación de fechas
- validación de capacidad
- validación de precio
- validación de estados
- ownership
- bloqueo de eventos cancelados
- filtros
- paginación
- ordenamiento

## Repositories

Funcionan como capa intermedia entre los servicios y el acceso a datos.

## DAO

Realizan las operaciones directamente sobre MongoDB mediante Mongoose.

---

# Pruebas realizadas

Las funcionalidades fueron probadas utilizando Postman.

| Caso | Resultado esperado |
|---|---|
| Crear evento como `user` | 403 |
| Crear evento como `organizer` | 201 |
| Crear evento con fecha pasada | 400 |
| Crear evento con `capacity: 0` | 400 |
| Crear evento con precio negativo | 400 |
| Organizer modifica evento propio | 200 |
| Organizer modifica evento ajeno | 403 |
| Admin modifica evento ajeno | 200 |
| Cancelar evento | 200 |
| Cambiar estado de evento cancelado | 400 |
| Consultar evento existente | 200 |
| Consultar evento inexistente | 404 |
| Listar eventos con filtros | 200 |
| Listar eventos con paginación | 200 |
| Ordenar eventos por fecha | 200 |

Ejemplo de listado probado:

```text
GET /api/events?status=published&category=workshop&page=1&limit=5&sort=date
```

También se verificó el filtrado por rango de fechas:

```text
GET /api/events?dateFrom=2026-10-01&dateTo=2026-12-31&page=1&limit=5
```

---

# Estructura principal

```text
src/
├── config/
│   ├── db.js
│   └── passport.config.js
├── controllers/
│   ├── events.controller.js
│   ├── sessions.controller.js
│   └── users.controller.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js
├── middlewares/
│   ├── auth.middleware.js
│   └── authorize.middleware.js
├── models/
│   ├── Event.js
│   └── User.js
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   ├── sessions.router.js
│   └── users.router.js
├── services/
│   └── events.service.js
├── utils/
│   ├── hash.js
│   └── jwt.js
├── app.js
└── server.js
```

---

# Seguridad

- Las contraseñas se almacenan mediante bcrypt.
- La autenticación utiliza JWT.
- El JWT se almacena en una cookie `httpOnly`.
- Los roles privilegiados no pueden asignarse desde el registro público.
- El organizador de un evento se obtiene desde el usuario autenticado y no desde el body.
- Los permisos se validan en el backend.
- Se diferencia entre errores `401` y `403`.
- Los organizadores no pueden modificar eventos ajenos.
- Los eventos cancelados no se eliminan físicamente.
- Las variables sensibles se almacenan en `.env`.
- `.env` y `node_modules` no deben subirse al repositorio.

---

# Estado de la Preentrega 6

Se completó la entidad `Event` y su lógica de negocio.

La API permite crear, listar, consultar, modificar y cancelar eventos respetando los permisos de cada rol y la propiedad del recurso.

El listado de eventos incorpora filtros por estado, categoría, ubicación y rango de fechas, además de paginación y ordenamiento.

La arquitectura mantiene separadas las responsabilidades entre rutas, controllers, services, repositories y DAO, dejando preparada la plataforma para los próximos módulos relacionados con inscripciones, tickets y control de cupos.