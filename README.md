# Plataforma de Eventos e Inscripciones - Preentrega 7

Proyecto desarrollado para el curso **Programación Backend II: Diseño y Arquitectura Backend** de Coderhouse.

## Descripción

Esta entrega incorpora el flujo completo de inscripciones a eventos mediante tickets.

Los usuarios autenticados pueden inscribirse a eventos publicados, siempre que haya cupos disponibles y no tengan una inscripción activa previa para el mismo evento.

También se implementan cancelaciones, control de cupos, consulta de tickets y envío de emails de confirmación mediante Nodemailer.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Passport
- JWT
- bcrypt
- Nodemailer
- dotenv
- Nodemon
- JavaScript
- ES Modules

## Instalación

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

## Variables de entorno

```env
PORT=
NODE_ENV=
MONGO_URL=
JWT_SECRET=
JWT_EXPIRES_IN=

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

Las credenciales reales deben mantenerse únicamente en `.env`.

El archivo `.env` no debe subirse al repositorio.

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

## Entidad Ticket

La entidad `Ticket` relaciona un usuario con un evento mediante referencias de MongoDB.

Campos principales:

```text
user
event
status
quantity
reservationCode
createdAt
cancelledAt
```

Los campos `user` y `event` utilizan referencias `ObjectId`, por lo que no se almacenan objetos completos dentro del ticket.

## Estados de Ticket

Los estados permitidos son:

```text
confirmed
pending
cancelled
```

Un ticket cancelado permanece almacenado en la base de datos pero deja de ocupar cupo.

## Flujo de inscripción

Para crear una inscripción se realizan las siguientes validaciones:

1. El evento debe existir.
2. El evento debe estar publicado.
3. El evento no puede estar cancelado ni finalizado.
4. `quantity` debe ser un número entero mayor a cero.
5. Debe haber cupos suficientes.
6. El usuario no puede tener otro ticket activo para el mismo evento.

Si todas las validaciones son correctas, se crea un ticket con estado:

```text
confirmed
```

y se genera un código de reserva único.

Después de confirmar la inscripción se envía un email utilizando Nodemailer.

## Control de cupos

Los cupos ocupados se calculan sumando la cantidad de entradas de todos los tickets activos del evento.

Los tickets con:

```text
status: cancelled
```

no se incluyen en el cálculo.

Por lo tanto, al cancelar una inscripción, esos cupos quedan disponibles nuevamente.

## Rutas

### Crear inscripción

```http
POST /api/events/:eid/tickets
```

Acceso:

```text
Usuario autenticado
```

Ejemplo de body:

```json
{
  "quantity": 1
}
```

Respuesta exitosa:

```text
201 Created
```

---

### Consultar mis tickets

```http
GET /api/tickets/my-tickets
```

Acceso:

```text
Usuario autenticado
```

La respuesta contiene únicamente los tickets del usuario autenticado.

Los datos del evento se obtienen mediante `populate`:

```text
title
date
location
```

---

### Consultar tickets de un evento

```http
GET /api/events/:eid/tickets
```

Acceso:

```text
organizer propietario del evento
admin
```

Un organizer no puede consultar las inscripciones correspondientes a eventos de otro organizer.

---

### Cancelar inscripción

```http
PATCH /api/tickets/:tid/cancel
```

Acceso:

```text
Dueño del ticket
admin
```

La cancelación no elimina el documento.

El ticket pasa a:

```text
status: cancelled
```

y se registra:

```text
cancelledAt
```

## Notificaciones por email

La aplicación utiliza Nodemailer para enviar un correo cuando una inscripción se confirma correctamente.

La configuración SMTP se obtiene mediante:

```env
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

Durante el desarrollo se utilizó Ethereal Email como servidor SMTP de prueba.

Las credenciales nunca están hardcodeadas en el código.

## Arquitectura

El módulo de tickets respeta la arquitectura por capas:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
Model
  ↓
MongoDB
```

La lógica de negocio se encuentra en la capa `services`.

Las rutas y controllers no realizan validaciones de cupos ni reglas de negocio.

## Archivos principales incorporados

```text
src/
├── controllers/
│   └── tickets.controller.js
├── dao/
│   └── tickets.dao.js
├── models/
│   └── Ticket.js
├── repositories/
│   └── tickets.repository.js
├── routes/
│   └── tickets.router.js
├── services/
│   └── tickets.service.js
└── utils/
    └── mailer.js
```

También se modificaron las rutas de eventos para incorporar:

```text
POST /api/events/:eid/tickets
GET  /api/events/:eid/tickets
```

## Validaciones implementadas

Se contemplan los siguientes casos:

```text
Inscripción exitosa
Usuario sin sesión
Evento inexistente
Evento cancelado o finalizado
Cantidad inválida
Falta de cupos
Inscripción duplicada
Cancelación propia
Cancelación de ticket ajeno
Consulta no autorizada de tickets de eventos
Organizer intentando consultar eventos ajenos
Cancelación repetida
```

## Pruebas

Las pruebas se realizaron utilizando Postman.

Se verificaron los siguientes comportamientos:

```text
Inscripción exitosa                  → 201
Inscripción sin sesión               → 401
Evento inexistente                   → 404
Evento cancelado/finalizado          → 400
Sin cupos suficientes                → 400
Inscripción duplicada                → 409
Cancelación propia                   → 200
Ticket ajeno como user               → 403
Consulta de tickets como user        → 403
Organizer sobre evento ajeno         → 403
```

También se verificó que:

- los tickets cancelados no sean eliminados;
- `cancelledAt` se registre;
- los cupos se liberen al cancelar;
- los tickets propios incluyan información del evento;
- se genere un código de reserva;
- el email de confirmación se genere mediante Nodemailer;
- las credenciales SMTP permanezcan en variables de entorno.

## Estado de la Preentrega 7

La entrega incluye:

- entidad `Ticket`;
- relaciones entre usuarios y eventos;
- control de cupos;
- prevención de duplicados;
- cancelaciones lógicas;
- liberación automática de cupos;
- consulta de tickets propios;
- consulta de tickets por evento con permisos;
- validaciones en services;
- envío de email con Nodemailer;
- configuración mediante variables de entorno.