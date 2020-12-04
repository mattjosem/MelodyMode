/**
 * A webpage application used to play different modes in differing modes
 * for the user. From here they are able to visually see the output of the mode in notes.
 * 
 * @author Matthew Molina
 */

/* Global Variable to store the chromatic series of notes (using sharps not flats). */
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#",
"A", "A#", "B"];

/* Global variable to check if the webpage is currently playing sound. */
var playing;

// Displays the notes of the scale initilized with the defaults values from the <form>.
// Sets the table as visible, this way if someone refreshes the page multiple times it
// doesn't show an empty table while the values get calculated.
displayMode(prepareMode());
document.getElementById("modeTable").style.visibility = "visible";

// Adds action listener to the play button.
document.querySelector('#playButton').addEventListener('click', async () => {
    await Tone.start();
    console.log('audio is ready');
    if(!playing){
        playMode(prepareMode());
    } else {
        return;
    }
});

// Adds action listener to the form asking for the root note.
document.querySelector('#root').addEventListener('change', async () => {
    displayMode(prepareMode());
});

// Adds action listener to the form asking for the mode.
document.querySelector('#mode').addEventListener('change', async () => {
    displayMode(prepareMode());
});

/**
 * Creates a dictionary that holds the root index in the notes array, chosen mode, and the chosen octave.
 */
function prepareMode () {
    var rootNote = document.getElementById("root").value;
    var rootIndex = notes.indexOf(rootNote);
    console.log("The chosen root note: " + rootNote);

    var mode = document.getElementById("mode").value;
    console.log("The chosen mode: " + mode);
    var chosenMode = getMode(mode);


    var octave = document.getElementById("octave").value;
    console.log("The chosen octave: " + octave);

    return createRootOctaveDict(rootIndex, chosenMode, octave);
}

/**
 * Returns an array of integers representing the half-steps in between
 * the notes of the parameter mode.
 * @param {string} modeName The chosen mdoe by the user. 
 */
function getMode (modeName) {
    var mode;
    switch(modeName) {
        case "Ionian":
            mode = [2, 2, 1, 2, 2, 2, 1];
            break;
        case "Dorian":
            mode = [2, 1, 2, 2, 2, 1, 2];
            break;
        case "Phrygian":
            mode = [1, 2, 2, 2, 1, 2, 2];
            break;
        case "Lydian":
            mode = [2, 2, 2, 1, 2, 2, 1];
            break;
        case "Mixolydian":
            mode = [2, 2, 1, 2, 2, 1, 2];
            break;
        case "Aeolian":
            mode = [2, 1, 2, 2, 1, 2, 2];
            break;
        case "Locrian":
            mode = [1, 2, 2, 1, 2, 2, 2];
            break;
        default:
            // default to Ionian
            mode = [2, 2, 1, 2, 2, 2, 1];
            break;
      }
      return mode;
}

/**
 * Returns dictionary that contains each index as the note and the octave associated with
 * the note. This is for playing purposed so the dictionary can be played in linear time.
 * @param {integer} rootIndex Index of the root note from the mode.
 * @param {string} chosenMode The mode chosen by the user.
 * @param {integer} octave The octave chosen by the user.
 */
function createRootOctaveDict (rootIndex, chosenMode, octave) {
    var noteCount = 0;
    var stepCount = 0;
    var modeDict = [];
    var prevIndex = rootIndex;
    while (noteCount < 8) {

        var index = (rootIndex + stepCount) % 12;
        if (prevIndex > index) { octave++; }
        modeDict.push({
            note: notes[index],
            octave: octave
        })
        stepCount += chosenMode[noteCount];
        noteCount++;
        prevIndex = index;
    }
    return modeDict;
}

/**
 * Displays the notes of the scale selected by the user from the <form>s.
 * @param rootOctaveDict A Dictionary containing the notes to be displayed to the webpage. 
 */
function displayMode (rootOctaveDict) {
    var index = 0;
    var tableRow = document.getElementById("modeTable").rows[0].cells;
    rootOctaveDict.forEach(dict => {
        tableRow[index].innerHTML = dict.note;
        index++;
    })
}

/**
 * Plays the mode via tone.js.
 * @param modeDict Dictionary containing the notes and octaves of those notes
 * to be played via tone.js in a linear fashion. 
 */
function playMode (modeDict) {
    playing = true;
    var now = Tone.now();
    const synth = new Tone.Synth().toDestination();
    var delay = 0;
    var [noteLength, noteDelay] = getNoteLengthDelay();
    modeDict.forEach(dict => {
        synth.triggerAttackRelease(dict.note + dict.octave, noteLength, now + delay);
        delay += noteDelay;
    });

    // this delays the play button so there isn't overlapping sound, but it allows
    // spamming of the button creating the scale to play as many times as the button was pressed
    const ogNow = now;
    while (now < ogNow + delay) {
        now = Tone.now();
    }
    playing = false;
}

 /**
  * Returns the length of the note and the delay between notes.
  */
function getNoteLengthDelay() {
    var delayLength = parseFloat(document.getElementById("delay").value);
    var noteLength;
    switch(delayLength) {
        case .2:
            noteLength = "16n";
            break;
        case .4:
            noteLength = "6n";
            break;
        case .6:
            noteLength = "4n";
            break;
        case .8:
            noteLength = "3n";
            break;
        case 1:
            noteLength = "2n";
            break;
        default:
            noteLength = "2n";
            break;
    }
    return [noteLength, delayLength];
}