console.log("lets write javascript");

let audio;
let currentSongName;
let playButton;
let playlist = [];
let currentIndex = -1;

// ----------------------
// Utility: clean URL
// ----------------------
function cleanUrl(url) {
    return decodeURIComponent(url)
        .replace(/\\/g, "/")
        .replace(/%5C/g, "")
        .replace(/%20/g, " ");
}

// ----------------------
// Fetch songs from JSON
// ----------------------
async function getSongsFromFolder(folderName = "") {
    // Fetch your songs.json file from the public folder
    const response = await fetch('/songs.json');
    const json = await response.json();

    if (!folderName) {
        // Return top-level "songs"
        return json.songs || [];
    } else {
        // Return songs from subfolder if exists
        return json[folderName] || [];
    }
}

// ----------------------
// Load songs when card clicked
// ----------------------
async function loadFolder(folderName) {
    playlist = await getSongsFromFolder(folderName);

    const songUl = document.querySelector(".songlist ul");
    songUl.innerHTML = "";

    playlist.forEach((songPath, index) => {
        const displayName = songPath.split("/").pop();

        songUl.insertAdjacentHTML("beforeend", `
            <li data-song="${folderName ? folderName + '/' + songPath : songPath}">
                <img class="invert" src="svg/music-note-03-stroke-rounded.svg" height="24px">
                <div class="info">
                    <div>${displayName}</div>
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
// Play music
// ----------------------
function playmusic(songPath, playBtnElement) {
    if (currentSongName === songPath) {
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

    audio = new Audio(`songs/${songPath}`);
    audio.play();

    currentSongName = songPath;
    playButton = playBtnElement;

    playBtnElement.src = "svg/pause-stroke-rounded.svg";
    playbarPlay.src = "svg/pause-stroke-rounded.svg";

    attachTimeUpdate();

    const songInfo = document.querySelector(".playerbar .songinfo");
    if (songInfo)
        songInfo.innerText = songPath.split("/").pop();

    audio.onended = () => {
        playbarNext.click();
    };
}

// ----------------------
// Attach song click events
// ----------------------
function attachSongEvents() {
    document.querySelectorAll(".songlist li").forEach((li, index) => {
        li.addEventListener("click", () => {
            currentIndex = index;
            const songPath = li.getAttribute("data-song");
            const playBtn = li.querySelector(".PlayNow img");

            playmusic(songPath, playBtn);

            localStorage.setItem("lastSong", songPath);
            localStorage.setItem("lastIndex", index);

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

        const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60).toString().padStart(2, "0");
            return `${m}:${s}`;
        };

        songTimeEl.innerText =
            `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });
}

// ----------------------
// Initialize
// ----------------------
async function main() {
    playlist = await getSongsFromFolder();

    const songUl = document.querySelector(".songlist ul");
    songUl.innerHTML = "";

    playlist.forEach((songPath, index) => {
        const displayName = songPath.split("/").pop();
        songUl.insertAdjacentHTML("beforeend", `
            <li data-song="${songPath}">
                <img class="invert" src="svg/music-note-03-stroke-rounded.svg" height="24px">
                <div class="info">
                    <div>${displayName}</div>
                    <div>Shashwat</div>
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
// Player controls, seekbar, search, sidebar
// ----------------------
// (keep all your previous code exactly as it is, no changes needed)
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

playbarPrev.addEventListener("click", () => {
    if (!playlist.length) return;
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : playlist.length - 1;
    const songPath = playlist[currentIndex];
    const li = document.querySelectorAll(".songlist li")[currentIndex];
    const playBtn = li.querySelector(".PlayNow img");
    playmusic(songPath, playBtn);
});

playbarNext.addEventListener("click", () => {
    if (!playlist.length) return;
    currentIndex = (currentIndex < playlist.length - 1) ? currentIndex + 1 : 0;
    const songPath = playlist[currentIndex];
    const li = document.querySelectorAll(".songlist li")[currentIndex];
    const playBtn = li.querySelector(".PlayNow img");
    playmusic(songPath, playBtn);
});

// ----------------------
// Rest of sidebar, seekbar, search, click handlers
// ----------------------
// (keep your original code unchanged)

main();