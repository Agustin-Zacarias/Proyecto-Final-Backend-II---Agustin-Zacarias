# Plataforma de Eventos - Backend

Proyecto desarrollado para el curso **Programación Backend II - Diseño y
Arquitectura Backend**.

API REST para una plataforma de eventos e inscripciones utilizando
Node.js, Express y MongoDB. El proyecto implementa autenticación con JWT
y Passport.js, autorización por roles, gestión de eventos, tickets,
control de capacidad, cancelaciones, correos de confirmación y una
arquitectura por capas con DAO, Repository, Service, Controller y DTO.

## Tecnologías

-   Node.js
-   Express
-   MongoDB
-   Mongoose
-   Passport.js
-   passport-local
-   passport-jwt
-   bcrypt
-   JSON Web Token (JWT)
-   cookie-parser
-   dotenv
-   Nodemailer
-   nodemon

## Instalación

``` bash
npm install
npm run dev
```

Para ejecución normal:

``` bash
npm start
```

Servidor por defecto:

``` text
http://localhost:8080
```

## Variables de entorno

Crear `.env` en la raíz tomando como referencia `.env.example`.

``` env
PORT=8080
MONGO_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1h
NODE_ENV=development
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

-   `PORT`: puerto del servidor.
-   `MONGO_URL`: conexión a MongoDB.
-   `JWT_SECRET`: clave para firmar/verificar JWT.
-   `JWT_EXPIRES_IN`: expiración del JWT.
-   `NODE_ENV`: entorno.
-   `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`:
    configuración SMTP.

`.env` contiene información sensible y no debe subirse al repositorio.

# Arquitectura

``` text
Request
   ↓
Routes
   ↓
Middlewares
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
DAO
   ↓
Models
   ↓
MongoDB
```

-   **Routes:** definen endpoints y middlewares.
-   **Controllers:** reciben requests, llaman services y construyen
    respuestas.
-   **Services:** contienen la lógica de negocio.
-   **Repositories:** capa intermedia entre services y DAO.
-   **DAO:** acceso directo a MongoDB mediante Mongoose.
-   **Models:** esquemas `User`, `Event` y `Ticket`.
-   **DTO:** controlan la información expuesta al cliente.

Los services no importan directamente modelos de Mongoose y los DAO son
la capa que accede directamente a ellos.

## Estructura

``` text
src/
├── config/
│   ├── db.js
│   └── passport.config.js
├── controllers/
│   ├── events.controller.js
│   ├── sessions.controller.js
│   ├── tickets.controller.js
│   └── users.controller.js
├── dao/
│   ├── events.dao.js
│   ├── tickets.dao.js
│   └── users.dao.js
├── dto/
│   ├── event.dto.js
│   ├── ticket.dto.js
│   └── user.dto.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   └── error.middleware.js
├── models/
│   ├── Event.js
│   ├── Ticket.js
│   └── User.js
├── repositories/
│   ├── events.repository.js
│   ├── tickets.repository.js
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   ├── sessions.router.js
│   ├── tickets.router.js
│   └── users.router.js
├── services/
│   ├── events.service.js
│   ├── sessions.service.js
│   ├── tickets.service.js
│   └── users.service.js
├── utils/
│   ├── hash.js
│   ├── jwt.js
│   └── mailer.js
├── app.js
└── server.js
```

# Usuarios y roles

Roles disponibles:

``` text
user
organizer
admin
```

### user

Es el rol asignado automáticamente al registrarse. El cliente no puede
elegir el rol mediante el body del registro.

### organizer

Puede crear eventos, modificar y cambiar el estado de sus propios
eventos y consultar sus tickets.

### admin

Puede realizar las operaciones administrativas sobre eventos y tickets,
incluyendo operaciones sobre recursos de otros organizadores.

Para pruebas, un usuario puede ser promovido a `organizer` o `admin`
directamente desde MongoDB.

# Autenticación

Passport.js centraliza tres estrategias:

``` text
register
login
current
```

### Registro

`POST /api/sessions/register`

Utiliza `passport-local`. Valida campos, email, contraseña y duplicados;
genera el hash con bcrypt y asigna `user`.

Ejemplo:

``` json
{
  "first_name": "Sofia",
  "last_name": "Lopez",
  "email": "sofia@mail.com",
  "password": "Secreta123"
}
```

La respuesta utiliza `UserDTO` y no incluye la contraseña.

### Login

`POST /api/sessions/login`

``` json
{
  "email": "sofia@mail.com",
  "password": "Secreta123"
}
```

Después de autenticarse se genera un JWT y se guarda en la cookie
HTTP-only `currentUser`.

### Current

`GET /api/sessions/current`

Utiliza la estrategia `current` de `passport-jwt`, obtiene el JWT desde
`currentUser` y deja el usuario autenticado disponible en `req.user`.

El JWT contiene:

``` text
id
email
role
```

No contiene la contraseña.

Sin sesión válida:

``` text
401 Unauthorized
```

### Logout

`POST /api/sessions/logout`

Elimina la cookie `currentUser`.

# Autorización

``` text
401 Unauthorized
```

Usuario no autenticado o JWT inválido.

``` text
403 Forbidden
```

Usuario autenticado sin permisos suficientes.

# Eventos

Campos principales:

``` text
title
description
category
date
location
capacity
price
status
organizer
```

Estados:

``` text
draft
published
cancelled
finished
```

Solo los eventos `published` aceptan nuevas inscripciones.

Validaciones:

-   La fecha debe ser válida y futura.
-   `capacity` debe ser mayor a 0.
-   `price` no puede ser negativo.
-   El estado debe ser válido.
-   Los eventos cancelados no pueden modificarse.
-   Al modificar la fecha mediante `PUT`, también debe ser futura.
-   El organizador no se modifica mediante el PUT general.
-   El cambio de estado utiliza su endpoint específico.

# Endpoints

## Health

`GET /api/health`

Comprueba que el servidor esté activo.

## Eventos

### `GET /api/events`

Lista eventos.

Filtros y parámetros:

``` text
status
category
location
dateFrom
dateTo
page
limit
sort
```

Ejemplo:

``` text
GET /api/events?status=published&page=2&limit=5
```

Respuesta:

``` json
{
  "status": "success",
  "data": [],
  "page": 2,
  "limit": 5,
  "total": 0,
  "totalPages": 0
}
```

### `GET /api/events/:eid`

Obtiene un evento por ID.

### `POST /api/events`

Crea un evento. Requiere `organizer` o `admin`.

``` json
{
  "title": "Evento de Tecnología",
  "description": "Evento de prueba",
  "category": "Tecnologia",
  "date": "2027-08-20T20:00:00.000Z",
  "location": "Buenos Aires",
  "capacity": 100,
  "price": 1500
}
```

Por defecto se crea como `draft`.

### `PUT /api/events/:eid`

Modifica un evento. Requiere autenticación y permite operar al
organizador propietario o a un admin.

``` json
{
  "title": "Evento actualizado",
  "description": "Descripción actualizada",
  "category": "Tecnologia",
  "date": "2027-08-20T20:00:00.000Z",
  "location": "Buenos Aires",
  "capacity": 100,
  "price": 1500
}
```

Una fecha pasada o inválida devuelve `400`. Un evento cancelado no puede
modificarse.

### `PATCH /api/events/:eid/status`

Cambia el estado.

``` json
{
  "status": "published"
}
```

Estados válidos:

``` text
draft
published
cancelled
finished
```

# Tickets / inscripciones

Campos:

``` text
user
event
status
quantity
reservationCode
createdAt
cancelledAt
```

Estados:

``` text
confirmed
pending
cancelled
```

Las relaciones usan referencias `ObjectId`.

### `POST /api/events/:eid/tickets`

Crea una inscripción. Requiere autenticación.

``` json
{
  "quantity": 1
}
```

Se valida:

-   existencia del evento;
-   estado `published`;
-   que no esté cancelado ni finalizado;
-   cantidad entera mayor a 0;
-   ausencia de inscripción activa duplicada;
-   capacidad disponible.

Inscripción activa duplicada:

``` text
409 Conflict
```

Sin cupos:

``` text
409 Conflict
```

### `GET /api/tickets/my-tickets`

Obtiene los tickets del usuario autenticado.

### `GET /api/events/:eid/tickets`

Obtiene los tickets de un evento. Requiere autenticación y acceso de
organizador propietario o admin.

Los usuarios poblados mediante `populate` se filtran con DTO y no
exponen contraseñas ni hashes.

### `PATCH /api/tickets/:tid/cancel`

Cancela un ticket sin eliminarlo.

El ticket pasa a:

``` text
status: "cancelled"
```

y se registra `cancelledAt`.

El propietario puede cancelar su ticket y un admin puede cancelar
tickets.

# Control de capacidad

Los tickets `confirmed` y `pending` ocupan capacidad. Los `cancelled`
no.

La capacidad ocupada se calcula sumando `quantity` de tickets activos.

Ejemplo:

``` text
Capacidad: 5

Ticket 1 → 1 → confirmed
Ticket 2 → 2 → confirmed
Ticket 3 → 1 → cancelled

Ocupados: 3
Disponibles: 2
```

Al cancelar un ticket, sus cupos vuelven a estar disponibles.

# Email de confirmación

Después de una inscripción confirmada se utiliza Nodemailer desde:

``` text
src/utils/mailer.js
```

El email incluye información del evento, fecha, lugar, cantidad y código
de reserva.

La configuración SMTP se obtiene exclusivamente desde variables de
entorno.

# Manejo de errores

Se utiliza:

``` text
src/middlewares/error.middleware.js
```

Códigos principales:

  Código   Significado
  -------- ------------------------------------------
  400      Datos inválidos u operación no permitida
  401      No autenticado o JWT inválido
  403      Sin permisos
  404      Recurso inexistente
  409      Conflicto con el estado actual
  500      Error interno

Ejemplos de `409`:

-   Email ya registrado.
-   Inscripción activa duplicada.
-   Sin cupos disponibles.

# Usuarios de prueba

Usuarios utilizados durante las pruebas locales:

### Usuario

``` text
Email: usuario.dto@test.com
Password: 12345678
Rol: user
```

### Organizador

``` text
Email: organizer.prueba@test.com
Password: 12345678
Rol: organizer
```

El usuario `organizer.prueba@test.com` fue registrado como `user` y
luego promovido a `organizer` en MongoDB para realizar las pruebas de
creación y administración de eventos.

Para probar operaciones administrativas, se puede asignar el rol `admin`
a un usuario de prueba desde MongoDB.

Estas credenciales son únicamente para pruebas locales.

# Flujo de autenticación

``` text
Registro
  ↓
Passport "register"
  ↓
Validaciones + bcrypt
  ↓
MongoDB
  ↓
Login
  ↓
Passport "login"
  ↓
JWT
  ↓
Cookie currentUser
  ↓
GET /current
  ↓
Passport "current"
  ↓
JWT válido
  ↓
req.user
```

# Flujo de inscripción

``` text
Login
  ↓
JWT + cookie
  ↓
Evento publicado
  ↓
POST /api/events/:eid/tickets
  ↓
Autenticación
  ↓
Ticket Controller
  ↓
Ticket Service
  ↓
Validación
  ↓
Capacidad
  ↓
Repository
  ↓
DAO
  ↓
MongoDB
  ↓
Ticket confirmado
  ↓
Nodemailer
```

# Pruebas realizadas

Las rutas fueron probadas utilizando Postman.

## Flujo de autenticación

``` text
POST /api/sessions/register → 201
POST /api/sessions/login    → 200
GET  /api/sessions/current  → 200
POST /api/sessions/logout   → 200
GET  /api/sessions/current  → 401
```

## DTO y contraseña

Se comprobó que el registro devuelve los datos públicos del usuario y no
devuelve `password`.

También se comprobó que los usuarios poblados dentro de tickets no
incluyen contraseña ni hash.

## Autorización

Un usuario con rol `user` intentando crear un evento recibe:

``` text
403 Forbidden
```

## Capacidad

Se creó un evento con:

``` text
capacity: 1
```

Una primera inscripción ocupó el único cupo. Una segunda inscripción
devolvió:

``` text
409 Conflict
```

con:

``` text
No hay cupos suficientes. Cupos disponibles: 0
```

## Cancelación

Se canceló una inscripción y posteriormente se comprobó que la capacidad
liberada podía utilizarse nuevamente.

## Passport current

Se comprobó que `GET /api/sessions/current` utiliza la estrategia
`current` y devuelve `200 OK` con una cookie válida.

## Error middleware

Se comprobó que los errores internos son capturados por el middleware
central y devueltos como `500 Internal Server Error`.

## Fecha futura en PUT

Se intentó modificar un evento utilizando una fecha pasada:

``` text
PUT /api/events/:eid
```

Resultado:

``` text
400 Bad Request
```

Respuesta:

``` json
{
  "status": "error",
  "message": "La fecha del evento debe ser futura"
}
```

## Paginación

Se verificó la estructura de paginación de:

``` text
GET /api/events?status=published&page=2&limit=5
```

con:

``` text
data
page
limit
total
totalPages
```

# Flujo final de entrega

El flujo completo requerido puede comprobarse así:

``` text
1. Register → Login → Current → Logout → Current 401
2. User intenta crear evento → 403
3. Organizer crea evento
4. Organizer publica evento
5. User se inscribe → ticket + email
6. Segundo intento activo → 409
7. Evento sin capacidad → 409
8. Cancelar ticket → capacidad liberada
9. Volver a inscribirse
10. Organizer intenta modificar evento ajeno → 403
11. Admin modifica evento ajeno
12. Verificar que ninguna respuesta exponga password
13. Consultar eventos con paginación
```

# Seguridad

-   Contraseñas almacenadas con bcrypt.
-   Contraseñas excluidas de respuestas.
-   Contraseñas excluidas del JWT.
-   JWT firmado mediante `JWT_SECRET`.
-   Expiración configurable.
-   Cookie HTTP-only.
-   `sameSite: "lax"`.
-   `secure` en producción.
-   Validación mediante Passport.
-   Autorización por roles.
-   El registro público asigna `user` desde el servidor.
-   Variables sensibles en `.env`.
-   `.env` excluido por `.gitignore`.
-   `node_modules` excluido por `.gitignore`.
-   Credenciales SMTP mediante variables de entorno.

# Git

No deben subirse:

``` text
node_modules/
.env
```

Debe incluirse:

``` text
.env.example
```

# Ejecución

``` bash
npm run dev
```

o:

``` bash
npm start
```

Servidor:

``` text
http://localhost:8080
```

Las rutas pueden probarse con Postman.

## Autor

Proyecto realizado para **Programación Backend II - Diseño y
Arquitectura Backend**.
