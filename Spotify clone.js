console.log("lets write javascript");

let audio;
let currentSongName;
let playButton;
let playlist = [];
let currentIndex = -1;
let currentFolder = ""; // ✅ track current folder

// ----------------------
// Fetch songs from JSON
// ----------------------
async function getSongsFromFolder(folderName = "") {
    const response = await fetch('/songs.json');
    const json = await response.json();

    if (!folderName || folderName === "songs") {
        return json.songs || [];
    } else {
        return json[folderName] || [];
    }
}

// ----------------------
// Load songs (IMPORTANT FIX)
// ----------------------
async function loadFolder(folderName = "") {
    currentFolder = folderName; // ✅ track folder

    playlist = await getSongsFromFolder(folderName);

    const songUl = document.querySelector(".songlist ul");
    songUl.innerHTML = "";

    playlist.forEach((song, index) => {
        songUl.insertAdjacentHTML("beforeend", `
            <li data-song="${song}">
                <img class="invert" src="svg/music-note-03-stroke-rounded.svg" height="24px">
                <div class="info">
                    <div>${song}</div>
                    <div></div>
                </div>
                <div class="PlayNow">
                    <span>Play Now</span>
                    <img class="invert" src="svg/play-circle-stroke-rounded.svg" height="24px">
                </div>
            </li>
        `);
    });

    attachSongEvents();
}

// ----------------------
// Play music (FIXED PATH)
// ----------------------
function playmusic(song, playBtnElement) {

    const fullPath = currentFolder
        ? `songs/${currentFolder}/${song}`
        : `songs/${song}`;

    if (currentSongName === fullPath) {
        if (audio.paused) {
            audio.play();
            playBtnElement.src = "svg/pause-stroke-rounded.svg";
            playbarPlay.src = "svg/pause-stroke-rounded.svg";
        } else {
            audio.pause();
            playBtnElement.src = "svg/play-circle-stroke-rounded.svg";
            playbarPlay.src = "svg/play-circle-stroke-rounded.svg";
        }
        return;
    }

    if (audio) {
        audio.pause();
        if (playButton)
            playButton.src = "svg/play-circle-stroke-rounded.svg";
    }

    audio = new Audio(fullPath);
    audio.play();

    currentSongName = fullPath;
    playButton = playBtnElement;

    playBtnElement.src = "svg/pause-stroke-rounded.svg";
    playbarPlay.src = "svg/pause-stroke-rounded.svg";

    attachTimeUpdate();

    const songInfo = document.querySelector(".playerbar .songinfo");
    if (songInfo)
        songInfo.innerText = song;

    audio.onended = () => {
        playbarNext.click();
    };
}

// ----------------------
// Attach click events
// ----------------------
function attachSongEvents() {
    document.querySelectorAll(".songlist li").forEach((li, index) => {
        li.addEventListener("click", () => {
            currentIndex = index;

            const song = li.getAttribute("data-song");
            const playBtn = li.querySelector(".PlayNow img");

            playmusic(song, playBtn);

            document.querySelectorAll(".songlist li")
                .forEach(el => el.classList.remove("selected"));

            li.classList.add("selected");
        });
    });
}

// ----------------------
// Time update
// ----------------------
function attachTimeUpdate() {
    if (!audio) return;

    audio.addEventListener("timeupdate", () => {
        const progressEl = document.querySelector(".progress");
        const circleEl = document.querySelector(".circle");
        const seekbarEl = document.querySelector(".seekbar");
        const songTimeEl = document.querySelector(".songtime");

        if (!audio.duration) return;

        const progress = (audio.currentTime / audio.duration) * 100;
        progressEl.style.width = progress + "%";
        circleEl.style.left = progress + "%";

        seekbarEl.style.background =
            `linear-gradient(to right, #009133 ${progress}%, #444 ${progress}%)`;

        const formatTime = (s) => {
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60).toString().padStart(2, "0");
            return `${m}:${sec}`;
        };

        songTimeEl.innerText =
            `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });
}

// ----------------------
// Init (ROOT LOAD FIX)
// ----------------------
async function main() {
    loadFolder(""); // ✅ load root songs
}

// ----------------------
// Player controls (FIXED)
// ----------------------
const playbarPrev = document.getElementById("previous");
const playbarPlay = document.getElementById("play");
const playbarNext = document.getElementById("next");

playbarPlay.addEventListener("click", () => {
    if (!audio) return;

    if (audio.paused) {
        audio.play();
        playbarPlay.src = "svg/pause-stroke-rounded.svg";
        if (playButton) playButton.src = "svg/pause-stroke-rounded.svg";
    } else {
        audio.pause();
        playbarPlay.src = "svg/play-circle-stroke-rounded.svg";
        if (playButton) playButton.src = "svg/play-circle-stroke-rounded.svg";
    }
});

// ✅ PREV
playbarPrev.addEventListener("click", () => {
    if (!playlist.length) return;

    currentIndex = (currentIndex > 0) ? currentIndex - 1 : playlist.length - 1;

    const li = document.querySelectorAll(".songlist li")[currentIndex];
    const song = playlist[currentIndex];
    const playBtn = li.querySelector(".PlayNow img");

    playmusic(song, playBtn);

    document.querySelectorAll(".songlist li")
        .forEach(el => el.classList.remove("selected"));

    li.classList.add("selected");
});

// ✅ NEXT
playbarNext.addEventListener("click", () => {
    if (!playlist.length) return;

    currentIndex = (currentIndex < playlist.length - 1) ? currentIndex + 1 : 0;

    const li = document.querySelectorAll(".songlist li")[currentIndex];
    const song = playlist[currentIndex];
    const playBtn = li.querySelector(".PlayNow img");

    playmusic(song, playBtn);

    document.querySelectorAll(".songlist li")
        .forEach(el => el.classList.remove("selected"));

    li.classList.add("selected");
});

// ----------------------
// Card click (FOLDER SWITCH FIX)
// ----------------------
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
        const folder = card.dataset.folder;
        loadFolder(folder);
    });
});

// ----------------------
// Start
// ----------------------
main();