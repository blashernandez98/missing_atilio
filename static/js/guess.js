
CURRENT_POSITION = ""

GUESSES = {"po": [[]], "ld": [[]], "zd": [[]],
            "zi": [[]], "li": [[]], "mcd": [[]],
            "mci": [[]], "md": [[]], "mi": [[]],
            "dd": [[]], "di": [[]]};

SOLVED = {}

INTENTOS = 0

FINISHED = false

MODE = "field"

function updateGuessedWords(letter){
    const current_player = GUESSES[CURRENT_POSITION]
    let current_guess = current_player.length
    let current_arr = current_player[current_guess - 1]

    if (current_arr.length < PLAYER_NAME.length && letter.length == 1){
        current_arr.push(letter)
        insert(letter, current_guess, current_arr.length)

    } else if (letter == "enter" && current_arr.length == PLAYER_NAME.length){
        if (current_player.length == 6){
            SOLVED[CURRENT_POSITION] = "terminada"
        }
        submitWord(current_arr, current_guess)
        INTENTOS++
        current_player.push([])

    } else if (letter == "backspace"){
        insert("", current_guess, current_arr.length)
        current_arr.pop()
    }
}

function insert(letter, row, column){
    current_square = document
            .getElementById(`letter${row}.${column}`)
    if (current_square)
        current_square.innerHTML = letter
}

function submitWord(word_arr, n_guess){
    guess_word = word_arr.join("").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    if (guess_word == PLAYER_NAME){
        SOLVED[CURRENT_POSITION] = "resuelta"
        modo_cancha(1)
        return
    } else if (n_guess == 6) {
        modo_cancha(1)
        return
    } else {
        let current_player = GUESSES[CURRENT_POSITION]
        let num_row = current_player.length
        let current_row = document.getElementById(`row${num_row}`)
        guess_word.split("").forEach((g_letter, i) => {
           colorLetter(PLAYER_NAME[i], g_letter, current_row.children[i])
        });
    }
}

// Function that colors letter div
function colorLetter(letter, guess, target){
    let result
    if (letter == guess){
        result = "perfect"
    } else if (PLAYER_NAME.includes(guess))
        result = "almost"
    else
        result = "wrong"
    
    if (!target.classList.contains("space_div"))
        target.classList.add(result)
}

function modo_cancha(n){
    if (!n){
        let cur_player = GUESSES[CURRENT_POSITION]
        if (cur_player){
            cur_player.pop()
            cur_player.push([])
        }
    } else {
        let player = document.getElementById(CURRENT_POSITION)
        player.children[1].innerHTML = ORIGINAL_PLAYER_NAME
    }
    if (Object.keys(SOLVED).length == 11 && !FINISHED){
        game_finish.children[1].innerHTML = `Intentos: ${INTENTOS}`
        game_finish.style.display = 'flex'
        FINISHED = true
    }
    destruirTablero();
    WORDLE.style.display = 'none';
    FIELD.style.display = 'flex';
    MODE = "field";
}

// Function that build board of letters for selected player
// @player: String repr of players position.

// Sets global variable CURRENT_POSITION with @player value

function buildBoard(player) {
    CURRENT_POSITION = player;
    const board = document.getElementById('board');
    const clicked_player = document.getElementById(player);
    ORIGINAL_PLAYER_NAME = clicked_player.getAttribute('player_name');
    PLAYER_NAME =  ORIGINAL_PLAYER_NAME
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .trim()

    for (let i = 0; i < 6; i++){
        let row = document.createElement('div');
        row.classList.add('row');
        row.setAttribute('id', `row${i+1}`);
        let offset = 0
        for (let j = 0; j < PLAYER_NAME.length; j++){
            if (PLAYER_NAME[j] == " "){
                offset++
                let space_div = document.createElement('div')
                space_div.classList.add("space_div")
                row.appendChild(space_div)
                continue
            }
            let square = document.createElement('div');
            square.classList.add('square');
            square.setAttribute('id', `letter${i+1}.${j+1-offset}`);
            square.setAttribute('letter',  PLAYER_NAME[j]);
            row.appendChild(square);

            let curr_try = GUESSES[player];
            if (curr_try[i] && curr_try[i][j]){
                square.innerHTML = curr_try[i][j]
                colorLetter(PLAYER_NAME[j], curr_try[i][j], square)
            }
        }
        board.appendChild(row);
    }
}

function destruirTablero() {
    const board = document.getElementById('board');
    board.innerHTML = "";
    CURRENT_POSITION = "";
}

document.onkeydown = ((e)=>{
    letter = e.key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    keyboard = ["a", "b", "c", "d", "e", "f", "g",
                "h", "i", "j", "k", "l", "m", "n",
                "ñ", "o", "p", "q", "r", "s", "t",
                "u", "v", "w", "x", "y", "z"]
    keyboard.push("enter", "backspace")

    if ((MODE != "wordle") || (CURRENT_POSITION in SOLVED)){
        return
    }
    else if (keyboard.includes(letter)){
        updateGuessedWords(letter);
    }
})