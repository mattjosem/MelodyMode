/**
 * A webpage application used to play different modes in differing modes
 * for the user. From here they are able to visually see the output of the mode in notes.
 * 
 * @author Matthew Molina
 */

/* Global Variable to store the chromatic series of notes (using sharps not flats). */
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#",
"A", "A#", "B"];

/* Global variable for the root note. */
var rootNote;

/* Global variable for the mode. */
var mode;

/* Global variable to check if the webpage is currently playing sound. */
var playing;

/* Global variable for the fretboard. */
var fb = fretboard.Fretboard();

/* Global variable for the score div in the html. */
var scoreDiv = document.getElementById("score")

// Updates the global variables of rootNote and mode.
updateModeProperties();

// Updates the fretboard with the chosen root note and mode.
updateFretboard();

// Displays the notes of the scale initilized with the defaults values from the <form>.
// Sets the table as visible, this way if someone refreshes the page multiple times it
// doesn't show an empty table while the values get calculated.
displayMode(prepareMode());

// Updates the score shown in the webpage.
updateScore();

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
    updateModeProperties();
    updateFretboard();
    displayMode(prepareMode());
    removeStaff();
    updateScore();
});

// Adds action listener to the form asking for the mode.
document.querySelector('#mode').addEventListener('change', async () => {
    updateModeProperties();
    updateFretboard();
    displayMode(prepareMode());
    removeStaff();
    updateScore();
});

// Adds action listener to the form asking for the mode.
document.querySelector('#octave').addEventListener('change', async () => {
    updateModeProperties();
    updateFretboard();
    displayMode(prepareMode());
    removeStaff();
    updateScore();
});


/**
 * Updates the global variables for the root note and mode.
 */
function updateModeProperties() {
    rootNote = document.getElementById("root").value;
    console.log("The chosen root note: " + rootNote);

    mode = document.getElementById("mode").value;
    console.log("The chosen mode: " + mode);
}


/**
 * Updates the fretboard on the webpage.
 */
function updateFretboard() {
    fb.clear()

    // Simply because fretboard.js uses 'major' instead of ionian 
    if (mode === "Ionian") {
        mode = "Major";
    }

    fb.add(rootNote.toLowerCase() + " " + mode.toLowerCase()).paint();
    fb.set("fretWidth", 96);    
}


/**
 * Updates the score on the webpage.
 */
function updateScore() {
    var VF = Vex.Flow;

    // Create an SVG renderer and attach it to the DIV element named "boo".
    var renderer = new VF.Renderer(scoreDiv, VF.Renderer.Backends.SVG);

    // Size of the SVG.
    renderer.resize(1000, 250);

    // Gets context for the drawing.
    var context = renderer.getContext();

    // Create a stave at position 20, 50 of width 1200 on the canvas.
    var stave = new VF.Stave(20, 50, 1200);

    // Add a clef and time signature to the stave.
    stave.addClef("treble").addTimeSignature("4/4");

    // Connect it to the rendering context and draw.
    stave.setContext(context).draw();

    // Uses the current root note and mode, updates scoreNotes array to contain the 
    // notes needed for the webpage score.
    var musicDict = prepareMode();
    var scoreNotes=[];
    musicDict.forEach(dict => {
        if(dict.note.includes("#")) {
            console.log("THERE WAS A SHARP");
            scoreNotes.push(
                new VF.StaveNote({keys: [dict.note.toLowerCase() + "/" + dict.octave], duration: "8" }).
                    addAccidental(0, new VF.Accidental("#"))
            )
        } else {
        scoreNotes.push(
            new VF.StaveNote({keys: [dict.note.toLowerCase() + "/" + dict.octave], duration: "8" })
        )
        console.log(dict.note.toLowerCase() + "/" + dict.octave);
        }
    });
    
    // Create a voice in 4/4 and add the notes from above.
    var voice = new VF.Voice({num_beats: 4,  beat_value: 4});
    voice.addTickables(scoreNotes);
    
    // Format and justify the notes to 1000 pixels.
    var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 1000);
    
    // Render voice
    voice.draw(context, stave);
}


/**
 * Removes the div containing the music staff to prevent updates overlapping.
 */
function removeStaff() {
    scoreDiv.removeChild(scoreDiv.lastChild);
}
    

/**
 * Creates a dictionary that holds the root index in the notes array, chosen mode, and the chosen octave.
 */
function prepareMode () {
    var rootIndex = notes.indexOf(rootNote);
    var chosenMode = getMode(mode);
    var octave = document.getElementById("octave").value;

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