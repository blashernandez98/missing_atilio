# Missing Atilio

A web application featuring interactive trivia games about Club Nacional de Football (Uruguay). This project was made possible thanks to the "Comisión de Historía y Estadística del Club Nacional de Football", with its comprehensive database at [atilio.uy](https://atilio.uy).

## About

Missing Atilio offers three different game modes that test your knowledge of Nacional's players and historic matches:

### 1. Missing 11
Guess the 11 players who played in historic Nacional matches using Wordle-style mechanics. Each player's name must be guessed letter by letter, with visual hints showing correct letters, misplaced letters, and incorrect letters.

### 2. ¿Quién tiene más? (Who Has More?)
Compare two Nacional players across different statistics (goals, matches, titles, etc.) and guess which player has the higher value. Build your streak by answering correctly.

### 3. Adivina el Jugador (Guess the Player)
Identify a mystery player by selecting from the squad. Each incorrect guess reveals comparative hints about the target player's nationality, position, debut year, statistics, and more.

## Data Source

All player and match data was scraped from **[atilio.uy](https://atilio.uy)**, the most comprehensive database of Club Nacional de Football statistics. Our scraped database includes:

- **840+ players** with detailed statistics, photos, and career information
- **1000+ historic matches** with lineups, results, and match details
- Player positions, debut information, and career achievements

## Tech Stack

- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Neon Database** (Serverless PostgreSQL)
- **Netlify** for deployment

## Running Locally

1. Clone the repository:
```bash
git clone https://github.com/yourusername/missing_atilio.git
cd missing_atilio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```bash
DATABASE_URL=your_neon_database_url
NEXT_PUBLIC_ENABLE_ADMIN=false
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
npm start
```

## License

This project is built using data from [atilio.uy](https://atilio.uy). Please respect the original data source and give proper credit.

---
