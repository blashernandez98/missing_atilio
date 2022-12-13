window.onload = function(){
    // Array of player's divs
    players = document.getElementsByClassName('player')
    
    // Back button
    btn_back = document.getElementById('back-btn')

    // Wordle grid
    WORDLE = document.getElementById('guess')

    // Full game container
    GAME = document.getElementById('game')

    // Field Container
    FIELD = document.getElementById('field')

    // Match-info Container and buttons
    match_info = document.getElementById('match-info-div')
    match_info.style.display = 'flex'
    match_info_btn = document.getElementById('match-info-btn')
    close_info_btn = document.getElementById('close-info')
    // Game finish container
    game_finish = document.getElementById('game-finish')
    game_finish.style.display = 'none'
    close_result_btn = document.getElementById('close-result')

    // Populates each player div with correct information
    // 'player_name' attribute set with player's name
    match = JSON.parse(GAME.getAttribute('match'))
    positions = {1: "#po", 2: "#ld", 3: "#zd", 4: "#zi",
                  5: "#li", 6: "#mcd", 7: "#mci", 8: "#md",
                  9: "#mi", 10: "#dd", 11: "#di"}

    for (let i = 1; i < 12; i++){
        let player = document.querySelector(positions[i])
        let player_name = match["equipo"][i].split(",")[0].trim()
        player.setAttribute('player_name', player_name)
        let number_letters = ""
        player_name.split(" ").forEach((part, idx)=>{
            if (idx > 0)
                number_letters += ", "
            number_letters += part.length
        })
        player.children[0].innerHTML = number_letters
        let asteriscos = ""
        player_name.split(" ").forEach(e => {
        asteriscos += "*".repeat(e.length)
        asteriscos += " "
        });
        player.children[1].innerHTML = asteriscos;
    }

        match_info.children[0].innerHTML = match.fecha.replaceAll("/", "-")
        match_info.children[1].innerHTML = `vs. ${match.rival}`
        match_info.children[2].innerHTML = match.resultado
        match_info.children[3].innerHTML = match.estadio.split("-")[0]

        // Adding click event listeners to every player
    // Switches to wordle mode
    for (let i = 0; i < players.length; i++){
        players[i].addEventListener('click', (e)=> {
            FIELD.style.display = 'none';
            WORDLE.style.display = 'flex';
            MODE = "wordle";
            buildBoard(e.target.id);
    })};

    // Back button click event listener
    // Switches to field-mode

    btn_back.addEventListener('click', algo)

    function algo(){
        modo_cancha(0)
    }

    match_info_btn.addEventListener('click', ()=>{
        match_info.style.display = "flex"
    })

    close_info_btn.addEventListener('click', ()=>{
        match_info.style.display = "none"
    })

    close_result_btn.addEventListener('click', ()=>{
        game_finish.style.display = 'none'
    })

}
