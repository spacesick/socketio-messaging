# socketio-messaging

This is a simple backend implementation for a real-time chatting web app using Node.js, Socket.io, and Prisma hooked to a PostgreSQL database. You can see a pairing frontend implementation in [one of my other repositories](https://github.com/spacesick/vehicle-rental-nuxt).

## Running the server

1. Clone this repository
2. Make sure you have npm and Node.js version 14 or higher installed
3. Install the required packages,

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and define the following environment variables,
   - `PORT`: the desired port for the server
   - `FRONT_END_DEPLOYMENT`: the URL of your frontend app
   - `DATABASE_URL`: the URL of your PostgreSQL database

   Below is an example,

   ```dotenv
   PORT=8080
   FRONT_END_DEPLOYMENT="http://localhost:3000"
   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
   ```

5. Run the following to migrate the Prisma schema into your database and generate a Prisma client,

   ```bash
   npx prisma db push
   npx prisma generate
   ```

6. Start the server,

   ```bash
   npm start
   ```
