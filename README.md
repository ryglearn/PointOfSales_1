# ProjectKasir - Backend API

Backend REST API untuk sistem point-of-sale (POS) berbasis Node.js. Aplikasi ini menyediakan fitur lengkap untuk manajemen inventory, transaksi, pengguna, dan pelanggan.

## Fitur Utama

- **Autentikasi & Autorisasi**: Login dengan JWT, role-based access control
- **Manajemen Pengguna**: CRUD operasi untuk pengguna dengan berbagai role
- **Manajemen Pelanggan**: Kelola data pelanggan
- **Manajemen Kategori Produk**: Organisasi produk berdasarkan kategori
- **Manajemen Produk**: CRUD untuk produk dengan auto-generate kode produk
- **Manajemen Transaksi**: Catat dan kelola transaksi penjualan
- **Validasi Data**: Validasi input menggunakan Zod schema
- **Keamanan**: Password hashing dengan bcrypt

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **Validation**: Zod
- **Security**: bcrypt, CORS
- **Development**: Nodemon

## Struktur Folder

```
src/
├── server.js                 # Entry point aplikasi
├── config/
│   └── db.js                # Konfigurasi koneksi MySQL
├── controllers/             # Business logic handler
│   ├── authController.js    # Auth & login
│   ├── userController.js    # User management
│   ├── customerController.js # Customer management
│   ├── categoryController.js # Category management
│   ├── productController.js  # Product management
│   └── transactionController.js # Transaction management
├── routes/                  # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── customerRoutes.js
│   ├── categoryRoutes.js
│   ├── productRoutes.js
│   └── transactionRoutes.js
├── middlewares/             # Middleware functions
│   ├── authMiddleware.js    # JWT verification
│   ├── roleMiddleware.js    # Role-based authorization
│   └── validate.js          # Zod validation
├── schemas/                 # Zod validation schemas
│   ├── userSchema.js
│   ├── customerSchema.js
│   ├── categorySchema.js
│   ├── productSchema.js
│   └── transactionSchema.js
└── utils/
    └── AutoGenerateCode.js  # Auto-generate product codes
```

## Instalasi

### Prerequisites

- Node.js (v14 atau lebih tinggi)
- MySQL Server
- npm atau yarn

### Setup

1. **Clone repository**

```bash
git clone <repository-url>
cd ProjectKasir_1/backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Konfigurasi environment variables**

Buat file `.env` di root folder:

```env
LISTEN_PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kasir_db
DB_PORT=3306
JWT_SECRET=your_secret_key
```

4. **Jalankan aplikasi**

Development mode (dengan auto-reload):

```bash
npm run dev
```

Production mode:

```bash
node src/server.js
```

Server akan berjalan pada `http://localhost:3000`

## API Endpoints

### Authentication

- (buat users manual di DB untuk dummy, tidak ada register disini)
- `POST /api/auth/login` - Login dan dapatkan JWT token

### Users

- `GET /api/users` - Daftar semua pengguna (Admin)
- `GET /api/users/:id` - Ambil detail pengguna
- `POST /api/users` - Buat pengguna baru (Admin)
- `PUT /api/users/:id` - Update pengguna
- `DELETE /api/users/:id` - Hapus pengguna (Admin)

### Customers

- `GET /api/customers` - Daftar semua pelanggan
- `GET /api/customers/:id` - Ambil detail pelanggan
- `POST /api/customers` - Buat pelanggan baru
- `PUT /api/customers/:id` - Update pelanggan
- `DELETE /api/customers/:id` - Hapus pelanggan

### Categories

- `GET /api/categories` - Daftar semua kategori
- `GET /api/categories/:id` - Ambil detail kategori
- `POST /api/categories` - Buat kategori baru
- `PUT /api/categories/:id` - Update kategori
- `DELETE /api/categories/:id` - Hapus kategori

### Products

- `GET /api/products` - Daftar semua produk
- `GET /api/products/:id` - Ambil detail produk
- `POST /api/products` - Buat produk baru (auto-generate kode)
- `PUT /api/products/:id` - Update produk
- `DELETE /api/products/:id` - Hapus produk

### Transactions

- `GET /api/transactions` - Daftar semua transaksi
- `GET /api/transactions/:id` - Ambil detail transaksi
- `POST /api/transactions` - Buat transaksi baru
- `PUT /api/transactions/:id` - Update transaksi
- `DELETE /api/transactions/:id` - Hapus transaksi

## Autentikasi

API menggunakan JWT untuk autentikasi. Setelah login, sertakan token di header:

```
Authorization: Bearer <your_jwt_token>
```

## Validasi Input

Input data divalidasi menggunakan Zod schema di folder `schemas/`. Setiap request otomatis divalidasi sebelum masuk ke controller.

## Keamanan

- Password di-hash menggunakan bcrypt sebelum disimpan
- JWT token untuk autentikasi stateless
- CORS enabled untuk request lintas domain
- Role-based access control untuk endpoint sensitif

## Contoh Penggunaan

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Membuat Produk Baru

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Produk A","price":50000,"categoryId":1}'
```

## Dependencies

| Package      | Versi  | Fungsi                |
| ------------ | ------ | --------------------- |
| express      | 5.2.1  | Web framework         |
| mysql2       | 3.16.0 | MySQL client          |
| jsonwebtoken | 9.0.3  | JWT authentication    |
| bcrypt       | 6.0.0  | Password hashing      |
| cors         | 2.8.5  | Cross-origin requests |
| dotenv       | 17.2.3 | Environment variables |
| zod          | 4.3.5  | Data validation       |

## Development Dependencies

| Package | Versi  | Fungsi                      |
| ------- | ------ | --------------------------- |
| nodemon | 3.1.11 | Auto-reload on file changes |

## Troubleshooting

### Koneksi Database Gagal

- Pastikan MySQL server berjalan
- Verifikasi credentials di file `.env`
- Pastikan database sudah dibuat

### JWT Error

- Pastikan JWT_SECRET sudah diset di `.env`
- Pastikan token dikirim di header `Authorization`

### Port Already in Use

- Ubah `LISTEN_PORT` di `.env`
- Atau matikan aplikasi lain yang menggunakan port 3000

## License

ISC

## Support

Untuk pertanyaan atau issues, silakan buat issue di repository ini.
