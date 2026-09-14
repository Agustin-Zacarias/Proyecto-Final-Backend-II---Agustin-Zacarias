# Plataforma de Eventos - Backend

Proyecto desarrollado para el curso **Programación Backend II - Diseño y Arquitectura Backend**.

El proyecto consiste en una API REST para una plataforma de eventos e inscripciones, utilizando Node.js, Express y MongoDB.

La aplicación implementa autenticación mediante JWT y Passport.js, autorización por roles, gestión de eventos, inscripción mediante tickets, control de capacidad, cancelación de inscripciones y envío de correos de confirmación.

En esta pre-entrega se incorpora y consolida una arquitectura por capas utilizando **DAO, Repository, Service, Controller y DTO**, separando las responsabilidades de cada parte de la aplicación.

---

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Passport.js
- passport-local
- passport-jwt
- bcrypt
- JSON Web Token (JWT)
- cookie-parser
- dotenv
- Nodemailer
- nodemon

---

## Instalación

Instalar las dependencias:

```bash
npm install
```

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

Para ejecutarlo normalmente:

```bash
npm start
```

Por defecto, el servidor se ejecuta en:

```text
http://localhost:8080
```

---

## Variables de entorno

El proyecto utiliza variables de entorno para almacenar la configuración y los datos sensibles.

Se debe crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Ejemplo:

```env
PORT=8080
NODE_ENV=development

MONGO_URL=

JWT_SECRET=
JWT_EXPIRES_IN=1h

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

### Variables utilizadas

- `PORT`: puerto utilizado por el servidor.
- `NODE_ENV`: entorno de ejecución.
- `MONGO_URL`: URL de conexión a MongoDB.
- `JWT_SECRET`: clave utilizada para firmar y verificar los JWT.
- `JWT_EXPIRES_IN`: tiempo de expiración del JWT.
- `MAIL_HOST`: servidor SMTP utilizado para enviar emails.
- `MAIL_PORT`: puerto del servidor SMTP.
- `MAIL_USER`: usuario del servicio de correo.
- `MAIL_PASS`: contraseña del servicio de correo.
- `MAIL_FROM`: dirección utilizada como remitente.

El archivo `.env` contiene información sensible y no debe subirse al repositorio.

---

# Arquitectura

El proyecto utiliza una arquitectura por capas para separar las responsabilidades.

```text
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

Los DTO se utilizan en la salida de los controllers para controlar qué información se devuelve al cliente.

---

## Estructura del proyecto

```text
src/
│
├── config/
│   ├── db.js
│   └── passport.config.js
│
├── controllers/
│   ├── events.controller.js
│   ├── sessions.controller.js
│   ├── tickets.controller.js
│   └── users.controller.js
│
├── dao/
│   ├── events.dao.js
│   ├── tickets.dao.js
│   └── users.dao.js
│
├── dto/
│   ├── event.dto.js
│   ├── ticket.dto.js
│   └── user.dto.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   └── error.middleware.js
│
├── models/
│   ├── Event.js
│   ├── Ticket.js
│   └── User.js
│
├── repositories/
│   ├── events.repository.js
│   ├── tickets.repository.js
│   └── users.repository.js
│
├── routes/
│   ├── events.router.js
│   ├── sessions.router.js
│   ├── tickets.router.js
│   └── users.router.js
│
├── services/
│   ├── events.service.js
│   ├── sessions.service.js
│   ├── tickets.service.js
│   └── users.service.js
│
├── utils/
│   ├── hash.js
│   ├── jwt.js
│   └── mailer.js
│
├── app.js
└── server.js
```

---

# Responsabilidades de cada capa

## Routes

Las rutas definen los endpoints disponibles y aplican los middlewares correspondientes.

No contienen lógica de negocio.

---

## Controllers

Los controllers se encargan de:

- Recibir la request.
- Obtener parámetros, body y query.
- Llamar al service correspondiente.
- Transformar la respuesta mediante DTO.
- Enviar la respuesta HTTP.

Los controllers no contienen la lógica de negocio de eventos o tickets.

---

## Services

Los services contienen la lógica de negocio de la aplicación.

Por ejemplo:

- Validación de eventos.
- Validación de estados.
- Control de capacidad.
- Validación de inscripciones duplicadas.
- Cancelación de tickets.
- Validación de permisos.
- Registro y login de usuarios.
- Envío de emails de confirmación.

Los services utilizan repositories y no acceden directamente a los modelos de Mongoose.

---

## Repositories

Los repositories funcionan como una capa intermedia entre los services y los DAO.

Exponen operaciones relacionadas con el dominio, por ejemplo:

- Buscar un usuario por email.
- Buscar eventos.
- Crear eventos.
- Buscar un evento por ID.
- Crear tickets.
- Obtener tickets de un usuario.
- Obtener tickets de un evento.
- Calcular capacidad ocupada.
- Cancelar tickets.

Los repositories no importan directamente los modelos de Mongoose.

---

## DAO

Los DAO son responsables del acceso directo a MongoDB mediante Mongoose.

Existe un DAO para cada entidad principal:

```text
events.dao.js
tickets.dao.js
users.dao.js
```

Son la única capa que accede directamente a los modelos.

---

## Models

Los modelos definen los esquemas utilizados por Mongoose para almacenar la información en MongoDB.

Entidades principales:

- `User`
- `Event`
- `Ticket`

Las relaciones entre entidades utilizan referencias mediante `ObjectId`.

---

# DTO

Se utilizan DTO para controlar la información que se devuelve en las respuestas de la API.

Actualmente existen:

```text
user.dto.js
event.dto.js
ticket.dto.js
```

### UserDTO

Devuelve información pública del usuario:

```text
id
first_name
last_name
email
role
```

La contraseña nunca se devuelve.

### EventDTO

Devuelve los datos principales del evento y filtra la información del organizador.

### TicketDTO

Devuelve los datos de la inscripción y, cuando existen documentos relacionados mediante `populate`, solamente expone la información necesaria.

Por ejemplo, un usuario poblado dentro de un ticket no devuelve su contraseña ni su hash.

---

# Autenticación

La autenticación se encuentra centralizada mediante Passport.js.

Se utilizan tres estrategias:

```text
register
login
current
```

## Register

Utiliza `passport-local`.

El registro:

- Valida campos obligatorios.
- Valida el formato del email.
- Normaliza el email.
- Verifica que el email no exista.
- Valida la longitud mínima de la contraseña.
- Genera el hash mediante bcrypt.
- Asigna el rol inicial `user`.
- Guarda el usuario mediante el service correspondiente.

Ruta:

```text
POST /api/sessions/register
```

---

## Login

Utiliza `passport-local`.

Valida el email y la contraseña utilizando bcrypt.

Ruta:

```text
POST /api/sessions/login
```

Después de una autenticación correcta se genera un JWT y se almacena en la cookie:

```text
currentUser
```

---

## Current

Utiliza `passport-jwt`.

Obtiene el JWT desde la cookie `currentUser` y valida su firma.

El JWT contiene:

```text
id
email
role
```

La contraseña no forma parte del JWT.

Ruta:

```text
GET /api/sessions/current
```

Si no existe una sesión válida:

```text
401 Unauthorized
```

---

## Logout

Elimina la cookie `currentUser`.

Ruta:

```text
POST /api/sessions/logout
```

---

# Autorización

El proyecto utiliza autorización basada en roles.

Roles utilizados:

```text
user
organizer
admin
```

El middleware `authorize` permite restringir determinadas rutas según el rol del usuario.

Por ejemplo, determinadas operaciones sobre eventos pueden ser realizadas por:

```text
organizer
admin
```

Las operaciones administrativas requieren:

```text
admin
```

Si el usuario está autenticado pero no posee los permisos necesarios:

```text
403 Forbidden
```

---

# Eventos

Los eventos contienen información como:

```text
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

Los estados disponibles son:

```text
draft
published
cancelled
finished
```

Un evento debe estar en estado:

```text
published
```

para permitir nuevas inscripciones.

La creación, modificación y cambio de estado de los eventos se encuentra separada en las distintas capas de la arquitectura.

---

# Tickets / Inscripciones

Los tickets representan las inscripciones de usuarios a eventos.

Cada ticket contiene:

```text
user
event
status
quantity
reservationCode
createdAt
cancelledAt
```

Los estados posibles son:

```text
confirmed
pending
cancelled
```

Las relaciones entre usuario y evento se almacenan mediante referencias `ObjectId`.

No se utilizan objetos embebidos para representar estas relaciones.

---

## Crear una inscripción

```text
POST /api/events/:eid/tickets
```

Requiere autenticación.

Ejemplo:

```json
{
  "quantity": 1
}
```

El service verifica:

- Que el evento exista.
- Que esté publicado.
- Que no esté cancelado.
- Que no esté finalizado.
- Que la cantidad sea un entero mayor a cero.
- Que el usuario no tenga una inscripción activa para el evento.
- Que exista capacidad suficiente.

---

## Consultar mis tickets

```text
GET /api/tickets/my-tickets
```

Requiere autenticación.

Devuelve solamente los tickets correspondientes al usuario autenticado.

El evento se obtiene mediante `populate` y el DTO filtra la información devuelta.

---

## Consultar tickets de un evento

```text
GET /api/events/:eid/tickets
```

Requiere autenticación.

Puede ser utilizado por:

- El organizador del evento.
- Un administrador.

Los datos del usuario se obtienen mediante `populate` y se filtran mediante el DTO.

La contraseña del usuario nunca forma parte de la respuesta.

---

## Cancelar una inscripción

```text
PATCH /api/tickets/:tid/cancel
```

Requiere autenticación.

El usuario puede cancelar sus propios tickets.

Un administrador también puede cancelar tickets.

La cancelación no elimina el documento de MongoDB.

El ticket pasa a:

```text
status: "cancelled"
```

y se registra:

```text
cancelledAt
```

---

# Control de capacidad

La capacidad se controla desde el service de tickets.

Los tickets activos ocupan capacidad:

```text
confirmed
pending
```

Los tickets cancelados no ocupan capacidad.

La capacidad ocupada se calcula sumando el campo:

```text
quantity
```

de los tickets activos.

Ejemplo:

```text
Capacidad del evento: 5

Ticket 1 → quantity 1 → confirmado
Ticket 2 → quantity 2 → confirmado
Ticket 3 → quantity 1 → cancelado

Capacidad ocupada: 3
Cupos disponibles: 2
```

Cuando un ticket se cancela, su cantidad deja de contabilizarse para la capacidad disponible.

---

# Notificaciones por email

Después de confirmar una inscripción, el sistema utiliza Nodemailer para enviar un correo de confirmación.

El envío se encuentra separado en:

```text
src/utils/mailer.js
```

El email incluye información como:

- Nombre del evento.
- Fecha.
- Lugar.
- Cantidad de entradas.
- Código de reserva.

La configuración SMTP se obtiene exclusivamente mediante variables de entorno.

No existen credenciales de correo hardcodeadas en el código.

---

# Manejo de errores

La API diferencia distintos tipos de errores HTTP:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

### 400

Datos inválidos o una operación no permitida por el estado actual del recurso.

### 401

El usuario no está autenticado o el JWT no es válido.

### 403

El usuario está autenticado pero no posee permisos suficientes.

### 404

El recurso solicitado no existe.

### 409

Existe un conflicto con el estado actual del recurso, por ejemplo una inscripción activa duplicada.

### 500

Error interno inesperado del servidor.

---

# Endpoints principales

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| GET | `/api/health` | Comprueba el funcionamiento del servidor | No |
| POST | `/api/sessions/register` | Registra un usuario | No |
| POST | `/api/sessions/login` | Inicia sesión | No |
| GET | `/api/sessions/current` | Obtiene el usuario autenticado | Sí |
| POST | `/api/sessions/logout` | Cierra la sesión | No |
| GET | `/api/events` | Obtiene eventos | No |
| GET | `/api/events/:eid` | Obtiene un evento | No |
| POST | `/api/events` | Crea un evento | Sí |
| PATCH | `/api/events/:eid/status` | Cambia el estado de un evento | Sí |
| POST | `/api/events/:eid/tickets` | Crea una inscripción | Sí |
| GET | `/api/tickets/my-tickets` | Obtiene los tickets del usuario | Sí |
| GET | `/api/events/:eid/tickets` | Obtiene los tickets de un evento | Sí |
| PATCH | `/api/tickets/:tid/cancel` | Cancela un ticket | Sí |
| GET | `/api/users` | Obtiene usuarios | Admin |

---

# Flujo principal

El flujo de inscripción funciona de la siguiente manera:

```text
Usuario
   ↓
Login
   ↓
JWT + cookie currentUser
   ↓
Evento publicado
   ↓
POST /api/events/:eid/tickets
   ↓
Auth middleware
   ↓
Ticket Controller
   ↓
Ticket Service
   ↓
Validación del evento
   ↓
Validación de inscripción duplicada
   ↓
Control de capacidad
   ↓
Ticket Repository
   ↓
Ticket DAO
   ↓
MongoDB
   ↓
Confirmación
   ↓
Nodemailer
   ↓
Email de confirmación
```

---

# Pruebas realizadas

Las rutas fueron probadas utilizando Postman.

## Flujo completo

```text
POST /api/sessions/register
→ 201 Created

POST /api/sessions/login
→ 200 OK

POST /api/events
→ 201 Created

PATCH /api/events/:eid/status
→ 200 OK

POST /api/events/:eid/tickets
→ 201 Created

GET /api/tickets/my-tickets
→ 200 OK

PATCH /api/tickets/:tid/cancel
→ 200 OK
```

También se comprobó que, después de cancelar una inscripción, la capacidad vuelve a estar disponible.

---

## Prueba de autenticación

Sin sesión:

```text
GET /api/tickets/my-tickets
→ 401 Unauthorized
```

---

## Prueba de autorización

Un usuario autenticado sin rol de administrador intentando acceder a:

```text
GET /api/users
```

obtiene:

```text
403 Forbidden
```

---

## Prueba de DTO

Los tickets poblados devuelven información limitada del usuario:

```text
id
first_name
last_name
email
```

No se devuelve:

```text
password
```

ni el hash de la contraseña.

---

## Prueba de capacidad

Se creó un evento con:

```text
capacity: 5
```

Se creó una inscripción de:

```text
quantity: 1
```

Luego se canceló la inscripción.

Posteriormente se creó una nueva inscripción de:

```text
quantity: 5
```

Resultado:

```text
201 Created
```

Esto demuestra que los tickets cancelados no ocupan capacidad.

---

# Seguridad

El proyecto implementa las siguientes medidas:

- Contraseñas almacenadas mediante bcrypt.
- Contraseñas excluidas de las respuestas.
- Contraseñas excluidas del JWT.
- JWT firmado mediante `JWT_SECRET`.
- Expiración configurable del JWT.
- JWT almacenado en cookie HTTP-only.
- Uso de `sameSite: "lax"`.
- `secure` habilitado en producción.
- Validación de JWT mediante Passport.
- Autorización basada en roles.
- Variables sensibles almacenadas en `.env`.
- `.env` excluido mediante `.gitignore`.
- `node_modules` excluido mediante `.gitignore`.
- Credenciales de correo almacenadas mediante variables de entorno.

---

# Git

No deben subirse al repositorio:

```text
node_modules/
.env
```

El archivo:

```text
.env.example
```

sí debe incluirse para indicar las variables necesarias para ejecutar el proyecto.

---

# Ejecución

Iniciar el proyecto:

```bash
npm run dev
```

Si la conexión con MongoDB es correcta, el servidor queda disponible en:

```text
http://localhost:8080
```

Las rutas pueden probarse utilizando Postman.

---

## Autor

Proyecto realizado para:

**Programación Backend II - Diseño y Arquitectura Backend**