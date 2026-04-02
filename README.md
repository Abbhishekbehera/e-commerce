# E-Commerce Application

An e-commerce application built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Password hashing with bcrypt
- Cookie-based session management
- MongoDB database integration
- Code formatting with Prettier

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcrypt for password hashing
- **Environment**: dotenv for configuration
- **Development**: nodemon for auto-restart, Prettier for code formatting

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file (see Environment Variables section)

## Usage

### Development
Run the application in development mode with auto-restart:
```bash
npm run dev
```

### Production
Run the application in production mode:
```bash
npm start
```

The server will start on the port specified in your environment variables (default: 3000).

## Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm run format`: Format code with Prettier
- `npm run format:check`: Check code formatting

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
```

## Dependencies

### Production
- `express`: Web framework for Node.js
- `mongoose`: MongoDB object modeling
- `jsonwebtoken`: JWT implementation
- `bcrypt`: Password hashing
- `cookie-parser`: Parse cookies
- `dotenv`: Load environment variables

### Development
- `prettier`: Code formatter
- `nodemon`: Auto-restart development server

## Project Structure

```
src/
  index.js          # Application entry point
package.json        # Project configuration
.prettierrc.json    # Prettier configuration
.prettierignore     # Files to ignore during formatting
README.md           # This file
```

## License

ISC

## Troubleshooting

- If formatting fails, check that Prettier is installed: `npm list prettier`
- Ensure your files are not in `.prettierignore`