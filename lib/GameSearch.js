const fs = require('fs')
const path = require('path')

// Load the JSON data from a file (adjust the file path as needed)
const gamesFilePath = path.join('app/data/partidos.json')
let gamesData = []

// Load JSON data
try {
  const rawData = fs.readFileSync(gamesFilePath)
  gamesData = JSON.parse(rawData)
} catch (error) {
  console.error('Error reading the JSON file:', error)
  process.exit(1) // Exit if there's an error loading the data
}

/**
 * Search for games by date (in dd/mm/yyyy format).
 * @param {string} date - The date in the format "dd/mm/yyyy".
 * @returns {Array} - An array of games that match the given date.
 */
function searchByDate(date) {
  return gamesData
    .filter((game, index) => game.fecha === date)
    .map((game, index) => ({ index, game }))
}

/**
 * Search for games by rival name (substring matching).
 * @param {string} rivalSubstring - A substring of the rival's name to search for.
 * @returns {Array} - An array of games where the rival's name contains the substring.
 */
function searchByRival(rivalSubstring) {
  return gamesData
    .filter((game, index) =>
      game.rival.toLowerCase().includes(rivalSubstring.toLowerCase())
    )
    .map((game, index) => ({ index, game }))
}

// Command-line interface (CLI) setup
const args = process.argv.slice(2) // Get arguments passed from the console

if (args.length === 0) {
  console.log(
    'Usage: node script.js --date <dd/mm/yyyy> OR --rival <substring>'
  )
  process.exit(1)
}

// Handle command-line arguments
if (args[0] === '--date' && args[1]) {
  const gamesOnDate = searchByDate(args[1])
  console.log(`Games on ${args[1]}:`, gamesOnDate)
} else if (args[0] === '--rival' && args[1]) {
  const gamesAgainstRival = searchByRival(args[1])
  console.log(
    `Games against rivals with "${args[1]}" in their name:`,
    gamesAgainstRival
  )
} else {
  console.log(
    'Invalid arguments. Use --date <dd/mm/yyyy> or --rival <substring>'
  )
}
