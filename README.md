# E-Commerce Microservices Platform

A scalable e-commerce backend built with **Node.js microservices**, **MongoDB**, **Redis caching**, **RabbitMQ event-driven messaging**, and **Docker Compose**.

Designed for internships, placements, and resume projects — production patterns without enterprise complexity.

---

## Architecture Overview

```mermaid
flowchart TB
    Client[Client / Frontend]

    subgraph Services
        US[User Service :5001]
        PS[Product Service :5002]
        OS[Order Service :5003]
        NS[Notification Service :5004]
        PayS[Payment Service :5005]
        CS[Cart Service :5006]
    end

    subgraph Infrastructure
        MongoDB[(MongoDB)]
        Redis[(Redis)]
        RMQ[RabbitMQ]
    end

    Client --> US
    Client --> PS
    Client --> CS
    Client --> OS
    Client --> PayS

    US --> MongoDB
    PS --> MongoDB
    OS --> MongoDB
    PayS --> MongoDB
    CS --> MongoDB

    PS --> Redis
    CS -->|REST| PS
    OS -->|REST| PS

    US -->|UserRegistered| RMQ
    OS -->|OrderPlaced / Cancelled / Shipped / Delivered| RMQ
    PayS -->|PaymentCompleted| RMQ
    RMQ --> NS
    NS --> Email[Nodemailer Email]
    NS --> SMS[Twilio SMS]
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js, Express.js |
| Database | MongoDB (separate DB per service) |
| Cache | Redis (Cache-Aside pattern) |
| Message Broker | RabbitMQ (Topic Exchange) |
| Auth | JWT |
| Payments | Stripe |
| Email | Nodemailer (Gmail) |
| SMS | Twilio |
| Logging | Winston |
| Validation | express-validator |
| Containers | Docker, Docker Compose |

---

## Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| User Service | 5001 | Registration, login, profile, password reset |
| Product Service | 5002 | Products, categories, inventory, Redis cache |
| Order Service | 5003 | Order placement, status, cancellation |
| Notification Service | 5004 | Email + SMS via RabbitMQ consumers |
| Payment Service | 5005 | Stripe payment intents |
| Cart Service | 5006 | Shopping cart management |
| MongoDB | 27017 | Database |
| Redis | 6379 | Product caching |
| RabbitMQ | 5672 / 15672 | Event messaging (Management UI) |

---

## Project Structure

```
e-commerce/
├── shared/utils/           # Shared utilities across services
│   ├── rabbitmq.js         # RabbitMQ connection, publish, subscribe
│   ├── redis.js            # Redis cache client
│   ├── eventPublisher.js   # Event publishing helpers
│   ├── emailService.js     # Nodemailer email templates
│   ├── smsService.js       # Twilio SMS templates
│   └── logger.js           # Winston logger
├── user-service/
├── product-service/
├── cart-service/
├── order-service/
├── payment-service/
├── notification-service/
│   └── consumers/          # RabbitMQ event consumers
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Redis Caching Flow (Product Service)

Uses **Cache-Aside Pattern**:

```mermaid
sequenceDiagram
    participant Client
    participant ProductService
    participant Redis
    participant MongoDB

    Client->>ProductService: GET /products
    ProductService->>Redis: Check cache key
    alt Cache Hit
        Redis-->>ProductService: Cached data
        ProductService-->>Client: Return cached response
    else Cache Miss
        ProductService->>MongoDB: Query database
        MongoDB-->>ProductService: Product data
        ProductService->>Redis: Store with TTL
        ProductService-->>Client: Return fresh response
    end

    Note over ProductService,Redis: On UPDATE/DELETE → invalidate cache
```

**Cached endpoints:**
- `GET /api/v1/products` — Product list (paginated)
- `GET /api/v1/products/product/:id` — Product details
- `GET /api/v1/products/categories` — All categories
- `GET /api/v1/products/category/:category` — Products by category
- `GET /api/v1/products/featured` — Frequently accessed products

**Cache invalidation** runs automatically on product create, update, delete, and stock deduction.

---

## RabbitMQ Event Flow

```mermaid
sequenceDiagram
    participant UserService
    participant OrderService
    participant PaymentService
    participant RabbitMQ
    participant NotificationService
    participant Email
    participant SMS

    UserService->>RabbitMQ: UserRegistered
    RabbitMQ->>NotificationService: Consume event
    NotificationService->>Email: Welcome Email
    NotificationService->>SMS: Registration SMS

    OrderService->>RabbitMQ: OrderPlaced
    RabbitMQ->>NotificationService: Consume event
    NotificationService->>Email: Order Confirmation
    NotificationService->>SMS: Order Placed SMS

    PaymentService->>RabbitMQ: PaymentCompleted
    RabbitMQ->>NotificationService: Consume event
    NotificationService->>Email: Payment Success
    NotificationService->>SMS: Payment Success SMS

    OrderService->>RabbitMQ: OrderCancelled / Shipped / Delivered
    RabbitMQ->>NotificationService: Consume & notify
```

**Events:**

| Event | Publisher | Consumer Action |
|-------|-----------|-----------------|
| `UserRegistered` | User Service | Welcome Email + SMS |
| `OrderPlaced` | Order Service | Order Confirmation Email + SMS |
| `PaymentCompleted` | Payment Service | Payment Success Email + SMS |
| `OrderShipped` | Order Service | Shipped SMS |
| `OrderDelivered` | Order Service | Delivered SMS |
| `OrderCancelled` | Order Service | Cancellation Email + SMS |

Failed message processing is **automatically requeued** (retry on failure).

---

## Docker Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Docker Compose v2+

### Quick Start

1. **Clone and configure environment:**

```bash
cp .env.example .env
# Edit .env with your credentials (JWT, Email, Twilio, Stripe)
```

2. **Build and run all services:**

```bash
docker-compose up --build
```

3. **Access services:**

| URL | Purpose |
|-----|---------|
| http://localhost:5001/health | User Service health |
| http://localhost:5002/health | Product Service health |
| http://localhost:5003/health | Order Service health |
| http://localhost:5004/health | Notification Service health |
| http://localhost:5005/health | Payment Service health |
| http://localhost:15672 | RabbitMQ Management (guest/guest) |

### Containers

| Container | Image |
|-----------|-------|
| mongo | mongo:7 |
| redis | redis:7-alpine |
| rabbitmq | rabbitmq:3-management-alpine |
| user-service | Custom (Node 18) |
| product-service | Custom (Node 18) |
| order-service | Custom (Node 18) |
| notification-service | Custom (Node 18) |
| payment-service | Custom (Node 18) |
| cart-service | Custom (Node 18) |

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
JWT_SECRET=your_jwt_secret

# Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio SMS
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Redis & RabbitMQ (auto-configured in Docker)
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

---

## API Documentation

### User Service — `http://localhost:5001/api/v1/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register user (publishes UserRegistered event) |
| POST | `/login` | No | Login and get JWT |
| GET | `/profile` | JWT | Get user profile |
| PUT | `/profile` | JWT | Update profile |
| POST | `/logout` | JWT | Logout |
| POST | `/forgot-password` | No | Send password reset email |
| POST | `/reset-password` | No | Reset password with token |

**Register body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890"
}
```

---

### Product Service — `http://localhost:5002/api/v1/products`

| Method | Endpoint | Cache | Description |
|--------|----------|-------|-------------|
| GET | `/` | Yes | List products (paginated) |
| GET | `/product/:id` | Yes | Get product by ID |
| GET | `/categories` | Yes | Get all categories |
| GET | `/category/:category` | Yes | Products by category |
| GET | `/featured` | Yes | Featured / frequently accessed |
| POST | `/create-product` | — | Create product |
| PUT | `/product/:id` | — | Update product (invalidates cache) |
| DELETE | `/product/:id` | — | Delete product (invalidates cache) |
| POST | `/bulk` | — | Bulk fetch by IDs |
| POST | `/bulk-deduct` | — | Deduct stock atomically |

---

### Cart Service — `http://localhost:5006/api/v1/cart`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | JWT | Get cart |
| POST | `/add` | JWT | Add item to cart |
| POST | `/remove` | JWT | Remove item |
| PUT | `/update` | JWT | Update quantity |
| POST | `/clear` | JWT | Clear cart |

---

### Order Service — `http://localhost:5003/api/v1/orders`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/order` | Place order (publishes OrderPlaced) |
| GET | `/orders/:userId` | Get user orders |
| GET | `/order/:userId/:id` | Get order by ID |
| PUT | `/order/:id/status` | Update status (shipped/delivered events) |
| PUT | `/order/:id/cancel` | Cancel order (publishes OrderCancelled) |

**Place order body:**
```json
{
  "userId": "user_id_here",
  "userEmail": "john@example.com",
  "userPhoneNumber": "+1234567890",
  "items": [
    { "productId": "product_id_here", "quantity": 2 }
  ]
}
```

---

### Payment Service — `http://localhost:5005/api/v1/payment`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create-intent` | JWT | Create Stripe payment intent |
| POST | `/confirm` | JWT | Confirm payment (publishes PaymentCompleted) |
| GET | `/status/:orderId` | JWT | Get payment status |
| GET | `/user/:userId` | JWT | Get user payments |
| POST | `/refund` | JWT | Refund payment |

---

### Notification Service — `http://localhost:5004/api/v1/notify`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health + active consumers |
| POST | `/welcome` | Manual welcome notification (testing) |
| POST | `/order-confirmation` | Manual order email/SMS |
| POST | `/payment-confirmation` | Manual payment email/SMS |
| POST | `/order-cancellation` | Manual cancellation email/SMS |
| POST | `/password-reset` | Manual password reset email |

> Primary notification flow is **event-driven via RabbitMQ**. REST endpoints are for testing.

---

## End-to-End Flow

1. **User registers** → User Service publishes `UserRegistered` → Notification sends Welcome Email + SMS
2. **User browses products** → Product Service serves from Redis cache when available
3. **User adds to cart** → Cart Service validates product via Product Service
4. **User places order** → Order Service deducts stock → publishes `OrderPlaced` → Email + SMS
5. **User pays** → Payment Service confirms via Stripe → publishes `PaymentCompleted` → Email + SMS
6. **Admin updates order status** → `shipped` / `delivered` triggers SMS notifications
7. **User cancels order** → publishes `OrderCancelled` → Email + SMS

---

## Local Development (without Docker)

```bash
# Start MongoDB, Redis, RabbitMQ locally first

# Install dependencies per service
cd user-service && npm install && npm run dev

# Repeat for each service in separate terminals
```

Ensure `.env` is configured at project root. Services import shared utilities from `../shared/utils/`.

---

## Key Design Decisions

- **Cache-Aside Redis** on read-heavy product endpoints with TTL-based expiry and write-time invalidation
- **RabbitMQ topic exchange** decouples services — no direct HTTP calls to Notification Service
- **Shared utilities folder** for DRY code without over-engineering a monorepo package
- **Winston logging** with console + file transports
- **express-validator** on auth routes for input validation
- **Separate MongoDB databases** per service in Docker (`user_db`, `product_db`, etc.)

---

## License

MIT License — open source for learning purposes.
