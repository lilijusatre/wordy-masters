const ANSWER_LENGTH = 5;
const ROUNDS =  6;
const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector('.info-bar');


async function init() {

    let currentGuess = '';
    let currentRow = 0;
    let done = false;
    let isLoading = true;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();

    const wordParts = word.split("");
    isLoading = false;
    setLoading(isLoading);

    function addLetter(letter){
        if(currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            //replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length -1) + letter;
        }
        letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText = letter;
    }

    // use tries to enter a guess
    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
        // do nothing
        return;
        }

        //validate the word
        isLoading = true;
        setLoading(isLoading);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({word: currentGuess}),
        });
        const resObj = await res.json();
        const validWord = resObj.validWord;
        // const {validWord} = resObj;

        isLoading = false;
        setLoading(isLoading);

        if(!validWord){
            markInvalidWord();
            return;
        }

        //do all the marking as correct, close or wrong
        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);




        for (let i = 0; i < ANSWER_LENGTH; i++) {
            //mark correct
            if(guessParts[i] === wordParts[i]){
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--;
            } 
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if(guessParts[i] === wordParts[i]){
                //do nothing
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0){
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                map[guessParts[i]]--;
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            }

        }
        //did they win or lose?
         
        
        
        currentRow++;
        if( currentGuess === word){
            //win
            alert('you win!!');
            document.querySelector('.brand').classList.add("winner")
            done = true;
            return
        }else if(currentRow === ROUNDS){
            alert(`you lose, the word was ${word}`);
            done = true;
        }
        currentGuess = '';
    }
    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = '';
    }

    function markInvalidWord(){
        // alert('not a valid word');

        for (let i = 0; i < ANSWER_LENGTH; i++){
            letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

            setTimeout(function(){
                letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
            }, 10)
        }
    }


    document.addEventListener('keydown', function handleKeyPress (event){
        if (done || isLoading){
            //do nothing
            return;
        }


        const action = event.key;
        
        if(action === 'Enter') {
            commit();
        } else if (action === "Backspace") {
            backspace();
        } else if (isLetter(action)){
            addLetter(action.toUpperCase())
        } else {
            //do nothing
        }
    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}
function setLoading(isLoading){
    loadingDiv.classList.toggle('hidden', !isLoading); //toggle() removes an existing token from the list and return false
}

// takes an array of letters (like ['E', 'L', 'I', 'T', 'E']) and creates
// make sure we get the correct amount of letters marked close instead
// of just wrong or correct
function makeMap(array) {
    // an object out of it (like {E: 2, L: 1, T: 1}) so we can use that to
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}
init();