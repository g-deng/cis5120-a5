# CIS 5120 A5: Implementation Prototypes
## Yarny: crochet and knitting companion.

Grace Deng, Seth Sukboontip, Maggie Du

- Expo Frontend
- Express Backend
- Supabase Database

Nearly all of the code in this repo has been created or edited with Claude Code.

This is an implementation prototype version of our final project meant to show specific targets.

## To Run

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```
DATABASE_URL=<your Supabase PostgreSQL connection string>
GEMINI_API_KEY=<your Google Generative AI key>
SUPABASE_URL=<your Supabase project URL>
SUPABASE_ANON_KEY=<your Supabase anon key>
```

Initialize the database and start the server:

```bash
npm run db:init
npm start
```

The backend runs on `http://localhost:3000`.

### Frontend

```bash
cd mobile
npm install
npx expo start
```

Then press `w` for web, `i` for iOS simulator, or `a` for Android emulator. You can also download the Expo Go app and scan the generated QR code to view the app on your phone.