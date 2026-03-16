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
// Fetch songs from folder
// ----------------------
async function getSongsFromFolder(folderPath = "") {

    let url = folderPath
        ? `/songs/${folderPath}/`
        : `/songs/`;

    let response = await fetch(url);
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let links = div.getElementsByTagName("a");

    let songs = [];

    for (let link of links) {
        if (link.href.endsWith(".mp3")) {

            let url = cleanUrl(link.href);
            let relativePath = url.split("/songs/")[1];

            songs.push(relativePath);
        }
    }

    return songs;
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
            <li data-song="${songPath}">
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

            document
                .querySelectorAll(".songlist li")
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
// Player controls
// ----------------------
const playbarPrev = document.getElementById("previous");
const playbarPlay = document.getElementById("play");
const playbarNext = document.getElementById("next");

playbarPlay.addEventListener("click", () => {

    if (!audio) return;

    if (audio.paused) {

        audio.play();
        playbarPlay.src = "svg/pause-stroke-rounded.svg";

        if (playButton)
            playButton.src = "svg/pause-stroke-rounded.svg";

    } else {

        audio.pause();
        playbarPlay.src = "svg/play-circle-stroke-rounded.svg";

        if (playButton)
            playButton.src = "svg/play-circle-stroke-rounded.svg";
    }

});

playbarPrev.addEventListener("click", () => {

    if (!playlist.length) return;

    currentIndex =
        (currentIndex > 0)
            ? currentIndex - 1
            : playlist.length - 1;

    const songPath = playlist[currentIndex];
    const li = document.querySelectorAll(".songlist li")[currentIndex];
    const playBtn = li.querySelector(".PlayNow img");

    playmusic(songPath, playBtn);

});

playbarNext.addEventListener("click", () => {

    if (!playlist.length) return;

    currentIndex =
        (currentIndex < playlist.length - 1)
            ? currentIndex + 1
            : 0;

    const songPath = playlist[currentIndex];
    const li = document.querySelectorAll(".songlist li")[currentIndex];
    const playBtn = li.querySelector(".PlayNow img");

    playmusic(songPath, playBtn);

});

// ----------------------
// Seekbar
// ----------------------
const circle = document.querySelector(".circle");
const seekbar = document.querySelector(".seekbar");

seekbar.addEventListener("click", (e) => {

    if (!audio || !audio.duration) return;

    const progress =
        (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    circle.style.left = progress + "%";

    seekbar.style.background =
        `linear-gradient(to right, #009133 ${progress}%, #444 ${progress}%)`;

    audio.currentTime =
        (audio.duration * progress) / 100;

});

// ----------------------
// Search
// ----------------------
const searchInput = document.getElementById("songSearch");

searchInput.addEventListener("input", () => {

    const filter = searchInput.value.toLowerCase();

    document.querySelectorAll(".songlist li").forEach((li) => {

        const songName =
            li.querySelector(".info div").innerText.toLowerCase();

        li.style.display =
            songName.includes(filter) ? "" : "none";

    });

});

// ----------------------
// Sidebar
// ----------------------
const hamburger = document.getElementById("hamburger");
const sidebar = document.querySelector(".left");
const overlay = document.getElementById("overlay");

hamburger.addEventListener("click", () => {

    hamburger.classList.toggle("active");
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    hamburger.classList.add("hide");

});

overlay.addEventListener("click", () => {

    hamburger.classList.remove("active");
    sidebar.classList.remove("active");
    overlay.classList.remove("active");

    hamburger.classList.remove("hide");

});

// ----------------------
// Card click -> load folder songs
// ----------------------
document.querySelectorAll(".card").forEach(card => {

    card.addEventListener("click", () => {

        const folder = card.dataset.folder;

        if (!folder) return;

        loadFolder(folder);

    });

});

let playerbar = document.querySelector(".playerbar");
let hideTimeout;

// Function to show playerbar
function showPlayerbar() {
    // Add visible class
    playerbar.classList.add("visible");

    // Clear any existing timeout
    if (hideTimeout) clearTimeout(hideTimeout);

    // Set timeout to hide after 20s
    hideTimeout = setTimeout(() => {
        playerbar.classList.remove("visible");
    }, 20000); // 20 seconds
}

// Click anywhere on screen to show the playerbar
document.addEventListener("click", (e) => {
    // Prevent showing if clicking inside playerbar itself
    if (!playerbar.contains(e.target)) {
        showPlayerbar();
    }
});

// Optional: clicking the playerbar itself also resets timer
playerbar.addEventListener("click", () => {
    showPlayerbar();
});

// Initially show playerbar for first 20s
showPlayerbar();

// ----------------------
// Start
// ----------------------
main();
