console.log("lets write javascript");

let audio;
let currentSongName;
let playButton;
let playlist = [];
let currentIndex = -1;
let currentFolder = ""; // track current folder for full paths

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
    const response = await fetch('/songs.json');
    const json = await response.json();

    if (!folderName) {
        return json.songs || [];
    } else {
        return json[folderName] || [];
    }
}

// ----------------------
// Load songs when card clicked
// ----------------------
async function loadFolder(folderName) {
    currentFolder = folderName; // track current folder

    const songs = await getSongsFromFolder(folderName);

    // FIX: playlist now stores full paths for prev/next
    playlist = songs.map(song => folderName ? folderName + '/' + song : song);

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
    const fullPath = `songs/${songPath}`;

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
    loadFolder(""); // load root songs
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

    const li = document.querySelectorAll(".songlist li")[currentIndex];
    const songPath = playlist[currentIndex];
    const playBtn = li.querySelector(".PlayNow img");

    playmusic(songPath, playBtn);

    document.querySelectorAll(".songlist li").forEach(el => el.classList.remove("selected"));
    li.classList.add("selected");
});

playbarNext.addEventListener("click", () => {
    if (!playlist.length) return;

    currentIndex = (currentIndex < playlist.length - 1) ? currentIndex + 1 : 0;

    const li = document.querySelectorAll(".songlist li")[currentIndex];
    const songPath = playlist[currentIndex];
    const playBtn = li.querySelector(".PlayNow img");

    playmusic(songPath, playBtn);

    document.querySelectorAll(".songlist li").forEach(el => el.classList.remove("selected"));
    li.classList.add("selected");
});

// ----------------------
// Seekbar click
// ----------------------
const seekbar = document.querySelector(".seekbar");
if (seekbar) {
    seekbar.addEventListener("click", (e) => {
        if (!audio || !audio.duration) return;

        const rect = seekbar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;

        audio.currentTime = percent * audio.duration;
    });
}

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

// ✅ Mobile open on card click
function openSidebarMobile() {
    if (window.innerWidth <= 768) {
        hamburger.classList.add("active");
        sidebar.classList.add("active");
        overlay.classList.add("active");
        hamburger.classList.add("hide");
    }
}

// ----------------------
// Card click
// ----------------------
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
        const folder = card.dataset.folder;
        if (!folder) return;

        loadFolder(folder);
        openSidebarMobile();
    });
});

// ----------------------
// Playerbar visibility
// ----------------------
let playerbar = document.querySelector(".playerbar");
let hideTimeout;
function showPlayerbar() {
    playerbar.classList.add("visible");

    if (hideTimeout) clearTimeout(hideTimeout);

    hideTimeout = setTimeout(() => {
        playerbar.classList.remove("visible");
    }, 20000);
}

document.addEventListener("click", (e) => {
    if (!playerbar.contains(e.target)) {
        showPlayerbar();
    }
});

playerbar.addEventListener("click", () => {
    showPlayerbar();
});

showPlayerbar();

// ----------------------
// Start
// ----------------------
main();