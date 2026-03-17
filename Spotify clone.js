console.log("Let's write javascript");

let audio = null;
let currentSongName = "";
let playButton = null;
let playlist = [];
let currentIndex = -1;

// ----------------------
// Fetch songs
// ----------------------
async function getSongsFromFolder(folderName = "") {
    const res = await fetch("/songs.json");
    const data = await res.json();

    return folderName ? (data[folderName] || []) : (data.songs || []);
}

// ----------------------
// Load folder
// ----------------------
async function loadFolder(folderName) {
    playlist = await getSongsFromFolder(folderName);

    const ul = document.querySelector(".songlist ul");
    ul.innerHTML = "";

    playlist.forEach((song, i) => {
        const name = song.split("/").pop();

        ul.insertAdjacentHTML("beforeend", `
            <li data-song="${folderName}/${song}">
                <div>${name}</div>
            </li>
        `);
    });

    attachSongEvents();
    openSidebar();
}

// ----------------------
// Play music
// ----------------------
function playmusic(songPath, btn = null) {

    if (audio) audio.pause();

    audio = new Audio(`songs/${songPath}`);
    audio.play();

    currentSongName = songPath;
    playButton = btn;

    showPlayerBar();

    document.querySelector(".songinfo").innerText =
        songPath.split("/").pop();

    attachTimeUpdate();

    audio.onended = () => nextSong();
}

// ----------------------
// Attach song clicks
// ----------------------
function attachSongEvents() {
    document.querySelectorAll(".songlist li").forEach((li, i) => {
        li.addEventListener("click", () => {
            currentIndex = i;
            playmusic(li.dataset.song);
        });
    });
}

// ----------------------
// Time update (seekbar)
// ----------------------
function attachTimeUpdate() {
    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;

        const percent = (audio.currentTime / audio.duration) * 100;

        document.querySelector(".progress").style.width = percent + "%";
        document.querySelector(".circle").style.left = percent + "%";

        const format = (t) =>
            `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, "0")}`;

        document.querySelector(".songtime").innerText =
            `${format(audio.currentTime)} / ${format(audio.duration)}`;
    });
}

// ----------------------
// Controls
// ----------------------
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");

playBtn.addEventListener("click", () => {
    if (!audio) return;

    if (audio.paused) audio.play();
    else audio.pause();
});

function nextSong() {
    if (!playlist.length) return;

    currentIndex = (currentIndex + 1) % playlist.length;
    playmusic(playlist[currentIndex]);
}

function prevSong() {
    if (!playlist.length) return;

    currentIndex =
        currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;

    playmusic(playlist[currentIndex]);
}

nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// ----------------------
// Seekbar click
// ----------------------
document.querySelector(".seekbar").addEventListener("click", (e) => {
    if (!audio || !audio.duration) return;

    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;

    audio.currentTime = percent * audio.duration;
});

// ----------------------
// Sidebar
// ----------------------
const hamburger = document.getElementById("hamburger");
const sidebar = document.querySelector(".left");
const overlay = document.getElementById("overlay");

function openSidebar() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
}

function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
}

hamburger.addEventListener("click", openSidebar);
overlay.addEventListener("click", closeSidebar);

// ----------------------
// Card click
// ----------------------
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
        loadFolder(card.dataset.folder);
    });
});

// ----------------------
// SEARCH FIX ✅
// ----------------------
const searchInput = document.getElementById("songSearch");

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    const filtered = playlist.filter(song =>
        song.toLowerCase().includes(query)
    );

    const ul = document.querySelector(".songlist ul");
    ul.innerHTML = "";

    filtered.forEach(song => {
        const name = song.split("/").pop();

        ul.insertAdjacentHTML("beforeend", `
            <li data-song="${song}">
                <div>${name}</div>
            </li>
        `);
    });

    attachSongEvents();
    openSidebar();
});

// ----------------------
// Init
// ----------------------
async function main() {
    playlist = await getSongsFromFolder();

    const ul = document.querySelector(".songlist ul");

    playlist.forEach(song => {
        ul.innerHTML += `<li data-song="${song}">${song}</li>`;
    });

    attachSongEvents();
}

// ----------------------
// Show playerbar (AUTO + CLICK + TIMER)
// ----------------------
let hideTimeout;

function showPlayerBar() {
    const bar = document.querySelector(".playerbar");
    if (!bar) return;

    // Show bar
    bar.classList.add("visible");

    // Clear previous timer
    if (hideTimeout) clearTimeout(hideTimeout);

    // Hide after 15 seconds
    hideTimeout = setTimeout(() => {
        bar.classList.remove("visible");
    }, 15000);
}

// Show playerbar when clicking anywhere
document.addEventListener("click", (e) => {
    const bar = document.querySelector(".playerbar");

    // Prevent double trigger when clicking inside playerbar
    if (bar && !bar.contains(e.target)) {
        showPlayerBar();
    }
});

// Show playerbar on page load
window.addEventListener("load", () => {
    showPlayerBar();
});

main();