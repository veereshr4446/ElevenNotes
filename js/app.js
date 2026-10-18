// ============================================================
//  APP.JS — All interactive behavior for ElevenNotes.
// ============================================================

const LS_PREFIX = 'elevenNotes_';
function lsGet(key, fallback) {
    try { const v = localStorage.getItem(LS_PREFIX + key); return v !== null ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
}
function lsSet(key, val) {
    try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch (e) { /* ignore */ }
}

// ============================================================
//  SIDEBAR
// ============================================================
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
    document.body.style.overflow = document.getElementById('sidebar').classList.contains('open') ? 'hidden' : '';
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================================
//  PAGE NAVIGATION
// ============================================================
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.sidebar-nav li a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.bottom-nav button[data-page]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    initProgressBars();

    if (pageId === 'planner') updatePlannerProgress();
    if (pageId === 'profile') setTimeout(updateSelectedAvatar, 100);
}

function scrollToSection(id) {
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// ============================================================
//  THEME
// ============================================================
function toggleTheme() {
    const html = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    lsSet('theme', newTheme);
}
function loadTheme() {
    const saved = lsGet('theme', 'light');
    document.documentElement.setAttribute('data-theme', saved);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}


// ============================================================
//  TOAST
// ============================================================
let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================================
//  GENERIC DETAIL MODAL
// ============================================================
function openModal(title, subtitle, contentHtml) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalSubtitle').textContent = subtitle;
    document.getElementById('modalContent').innerHTML = contentHtml;
    document.getElementById('detailModal').classList.add('active');

    document.body.classList.add('modal-open');
}
function closeModal() {
    document.getElementById('detailModal').classList.remove('active');

    document.body.classList.remove('modal-open');
}
// ----- Stat card click handlers -----
function showStreakDetails() {
    document.getElementById('streakModal').classList.add('active');
}

function closeStreakDetails() {
    document.getElementById('streakModal').classList.remove('active');
}

function showAllSubjects() {
    const html = subjectsData.map((s, i) => `<div class="modal-item"><span>${i + 1}. ${s.code}</span><span>${s.name}</span></div>`).join('');
    openModal('📚 All Subjects', `Total: ${subjectsData.length} subjects`, html);
}
function showCollegeEvents() {

    const slides = [

        /* =========================
           SLIDE 1
        ========================= */
        `
        <div class="vh-slide">
            <div class="vh-slide-header">
                <div class="vh-category-icon">💻</div>
                <div>
                    <span>VIDHARA 2K26–27 • CSE DEPARTMENT</span>
                    <h3>TECHNICAL EVENTS</h3>
                </div>
            </div>

            <div class="vh-event-card blue-card">
                <div class="vh-event-icon">🌐</div>
                <div class="vh-event-info">
                    <h4>Web Development</h4>
                    <p>
                        Develop a web-based solution for a real-world
                        problem by integrating Artificial Intelligence.
                    </p>
                    <div class="vh-highlight">
                        AI tools/models, web technologies, databases and APIs can be used.
                    </div>
                </div>
            </div>

            <div class="vh-event-card purple-card">
                <div class="vh-event-icon">🧠</div>
                <div class="vh-event-info">
                    <h4>Mind Hack</h4>
                    <p>
                        Solve logic traps, pattern puzzles and
                        misleading clues.
                    </p>
                    <div class="vh-highlight">
                        Tests logical thinking, observation, pattern recognition and problem-solving.
                    </div>
                </div>
            </div>

            <div class="vh-event-card pink-card">
                <div class="vh-event-icon">🐞</div>
                <div class="vh-event-info">
                    <h4>Coding & Debugging</h4>
                    <p>
                        Debugging Duel: identify and fix errors in
                        a given program within the specified time limit.
                    </p>
                    <div class="vh-highlight">
                        Reverse Coding: write the program that produces the given output.
                    </div>
                </div>
            </div>
        </div>
        `,

        /* =========================
           SLIDE 2
        ========================= */
        `
        <div class="vh-slide">
            <div class="vh-slide-header">
                <div class="vh-category-icon">🏆</div>
                <div>
                    <span>VIDHARA 2K26–27 • CSE DEPARTMENT</span>
                    <h3>TECHNICAL EVENTS</h3>
                </div>
            </div>

            <div class="vh-event-card blue-card">
                <div class="vh-event-icon">🏆</div>
                <div class="vh-event-info">
                    <h4>Tech Quiz</h4>
                    <p>
                        A quiz focused completely on technology
                        and computer science.
                    </p>
                    <div class="vh-highlight">
                        Programming • OS • DBMS • Cybersecurity • Technologies • Gadgets • Rapid Fire
                    </div>
                </div>
            </div>

            <div class="vh-event-card purple-card">
                <div class="vh-event-icon">🔎</div>
                <div class="vh-event-info">
                    <h4>Web Search Hunt</h4>
                    <p>
                        A multiplayer online search challenge where
                        participants solve riddles and puzzles using the web.
                    </p>
                    <div class="vh-highlight">
                        Logical thinking • Web searching • Observation • Teamwork
                    </div>
                </div>
            </div>

            <div class="vh-event-card pink-card">
                <div class="vh-event-icon">💡</div>
                <div class="vh-event-info">
                    <h4>Tech Pitch</h4>
                    <p>
                        Present and pitch a technology-based idea,
                        product or solution before the judges.
                    </p>
                    <div class="vh-highlight">
                        Problem statement • Innovation • Solution • Technology • Feasibility
                    </div>
                </div>
            </div>
        </div>
        `,

        /* =========================
           SLIDE 3
        ========================= */
        `
        <div class="vh-slide">
            <div class="vh-slide-header">
                <div class="vh-category-icon">🎮</div>
                <div>
                    <span>VIDHARA 2K26–27</span>
                    <h3>GAMES</h3>
                </div>
            </div>

            <div class="vh-event-card blue-card">
                <div class="vh-event-icon">🗺️</div>
                <div class="vh-event-info">
                    <h4>Treasure Hunt</h4>
                    <p>
                        Find clues, solve challenges and race
                        towards the final treasure.
                    </p>
                </div>
            </div>

            <div class="vh-event-card red-card">
                <div class="vh-event-icon">🔥</div>
                <div class="vh-event-info">
                    <h4>Free Fire</h4>
                    <p>
                        Competitive gaming event open to
                        participating students.
                    </p>
                    <div class="vh-highlight">
                        Open to all branches
                    </div>
                </div>
            </div>

            <div class="vh-event-card purple-card">
                <div class="vh-event-icon">🎮</div>
                <div class="vh-event-info">
                    <h4>BGMI</h4>
                    <p>
                        Competitive multiplayer gaming event
                        for participating students.
                    </p>
                    <div class="vh-highlight">
                        Open to all branches
                    </div>
                </div>
            </div>
        </div>
        `,

        /* =========================
           SLIDE 4
        ========================= */
        `
        <div class="vh-slide">
            <div class="vh-slide-header">
                <div class="vh-category-icon">🎭</div>
                <div>
                    <span>17 OCTOBER • ACTIVITIES</span>
                    <h3>GROUP & FUN ACTIVITIES</h3>
                </div>
            </div>

            <div class="vh-event-card blue-card">
                <div class="vh-event-icon">💃</div>
                <div class="vh-event-info">
                    <h4>Flash Mob</h4>
                    <p>
                        Dance performance featuring both
                        group and individual participation.
                    </p>
                    <div class="vh-highlight">
                        17 October
                    </div>
                </div>
            </div>

            <div class="vh-event-card purple-card">
                <div class="vh-event-icon">💪</div>
                <div class="vh-event-info">
                    <h4>Tug of War</h4>
                    <p>
                        Team-based competition between
                        participating departments.
                    </p>
                    <div class="vh-highlight">
                        Department of DS & CY
                    </div>
                </div>
            </div>

            <div class="vh-event-card pink-card">
                <div class="vh-event-icon">🏏</div>
                <div class="vh-event-info">
                    <h4>Mini Cricket</h4>
                    <p>
                        Short-format cricket competition
                        between participating teams.
                    </p>
                    <div class="vh-highlight">
                        Department of DS & CY
                    </div>
                </div>
            </div>

            <div class="vh-event-card blue-card">
                <div class="vh-event-icon">🏸</div>
                <div class="vh-event-info">
                    <h4>Badminton / Football</h4>
                    <p>
                        Choose between badminton or football
                        and participate with students across branches.
                    </p>
                    <div class="vh-highlight">
                        Open to all branches
                    </div>
                </div>
            </div>
        </div>
        `,

        /* =========================
           SLIDE 5
        ========================= */
        `
        <div class="vh-slide vh-final-slide">
            <div class="vh-slide-header">
                <div class="vh-category-icon">👗</div>
                <div>
                    <span>18 OCTOBER</span>
                    <h3>ETHNIC DAY</h3>
                </div>
            </div>

            <div class="vh-ethnic-hero">
                <div class="vh-ethnic-icon">📸</div>
                <h3>Ethnic Day</h3>
                <p>
                    Celebrate the day with traditional
                    outfits and capture memorable moments.
                </p>

                <div class="vh-photo-booth">
                    📸 Photo Booth
                </div>
            </div>

            <div class="vh-date-badge">
                <strong>18 OCTOBER</strong>
                <span>Ethnic Day Celebration</span>
            </div>
        </div>
        `
    ];

    let currentSlide = 0;

    const content = `
        <div class="vh-modal">

            <div class="vh-modal-top">
                <div>
                    <h2>⚡ VIDHARA 2K26–27</h2>
                    <p>CSE Department • Tech Fest • 16–18 October</p>
                </div>

                <button
                    class="vh-close"
                    onclick="closeModal()"
                    aria-label="Close">
                    &times;
                </button>
            </div>

            <div class="vh-carousel">

                <div class="vh-track" id="vhTrack">

                    ${slides.map(slide => `
                        <div class="vh-carousel-slide">
                            ${slide}
                        </div>
                    `).join('')}

                </div>

            </div>

            <div class="vh-navigation">

                <button
                    class="vh-nav-btn"
                    id="vhPrev"
                    type="button"
                    aria-label="Previous slide">

                    <i class="fas fa-chevron-left"></i>

                </button>

                <div class="vh-dots" id="vhDots">

                    ${slides.map((_, index) => `
                        <button
                            class="vh-dot ${index === 0 ? 'active' : ''}"
                            data-slide="${index}"
                            type="button"
                            aria-label="Go to slide ${index + 1}">
                        </button>
                    `).join('')}

                </div>

                <button
                    class="vh-nav-btn"
                    id="vhNext"
                    type="button"
                    aria-label="Next slide">

                    <i class="fas fa-chevron-right"></i>

                </button>

            </div>

            <div class="vh-slide-count" id="vhSlideCount">
                1 / ${slides.length}
            </div>

        </div>
    `;

    openModal(
        '⚡ VIDHARA 2K26–27',
        'CSE Department • Tech Fest • 16–18 October',
        content
    );

    setTimeout(() => {

        const track = document.getElementById('vhTrack');
        const prev = document.getElementById('vhPrev');
        const next = document.getElementById('vhNext');
        const dots = document.querySelectorAll('.vh-dot');
        const count = document.getElementById('vhSlideCount');

        if (!track || !prev || !next) return;


        /* =====================================================
           UPDATE CAROUSEL
        ===================================================== */

        function updateSlide() {

            track.style.transform =
                `translateX(-${currentSlide * 100}%)`;

            dots.forEach((dot, index) => {

                dot.classList.toggle(
                    'active',
                    index === currentSlide
                );

            });
                        if (count) {
            
                            count.textContent =
                                `${currentSlide + 1} / ${slides.length}`;
            
                        }
            
            function onKey(e) {
                if (!track.isConnected) {            // modal was closed, so clean up
                    document.removeEventListener('keydown', onKey);
                    return;
                }
                if (e.key === 'ArrowRight') nextSlide();
                if (e.key === 'ArrowLeft')  previousSlide();
            }
            document.addEventListener('keydown', onKey);


            /* -----------------------------------------------
               Disable arrows at the beginning/end
            ----------------------------------------------- */

            prev.disabled = currentSlide === 0;
            next.disabled = currentSlide === slides.length - 1;

            prev.style.opacity =
                currentSlide === 0 ? '0.45' : '1';

            next.style.opacity =
                currentSlide === slides.length - 1 ? '0.45' : '1';

            prev.style.pointerEvents =
                currentSlide === 0 ? 'none' : 'auto';

            next.style.pointerEvents =
                currentSlide === slides.length - 1 ? 'none' : 'auto';
        }


        /* =====================================================
           NEXT
        ===================================================== */

        function nextSlide() {

            if (currentSlide >= slides.length - 1) {
                return;
            }

            currentSlide++;

            updateSlide();
        }


        /* =====================================================
           PREVIOUS
        ===================================================== */

        function previousSlide() {

            if (currentSlide <= 0) {
                return;
            }

            currentSlide--;

            updateSlide();
        }


        /* =====================================================
           BUTTONS
        ===================================================== */

        next.addEventListener(
            'click',
            nextSlide
        );

        prev.addEventListener(
            'click',
            previousSlide
        );


        /* =====================================================
           DOTS
        ===================================================== */

        dots.forEach(dot => {

            dot.addEventListener(
                'click',
                () => {

                    const target =
                        Number(dot.dataset.slide);

                    if (
                        Number.isNaN(target) ||
                        target < 0 ||
                        target >= slides.length
                    ) {
                        return;
                    }

                    currentSlide = target;

                    updateSlide();

                }
            );

        });


        /* =====================================================
           TOUCH SWIPE
        ===================================================== */

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        track.addEventListener(
            'touchstart',
            event => {

                const touch =
                    event.changedTouches[0];

                touchStartX = touch.screenX;
                touchStartY = touch.screenY;

            },
            { passive: true }
        );


        track.addEventListener(
            'touchend',
            event => {

                const touch =
                    event.changedTouches[0];

                touchEndX = touch.screenX;
                touchEndY = touch.screenY;

                const diffX =
                    touchStartX - touchEndX;

                const diffY =
                    touchStartY - touchEndY;


                /* Ignore mostly vertical scrolling */

                if (
                    Math.abs(diffX) < 50 ||
                    Math.abs(diffX) < Math.abs(diffY)
                ) {
                    return;
                }


                /* Swipe LEFT → NEXT */

                if (diffX > 0) {

                    if (
                        currentSlide <
                        slides.length - 1
                    ) {
                        currentSlide++;
                        updateSlide();
                    }

                    return;
                }


                /* Swipe RIGHT → PREVIOUS */

                if (diffX < 0) {

                    if (currentSlide > 0) {
                        currentSlide--;
                        updateSlide();
                    }

                }

            },
            { passive: true }
        );


        /* =====================================================
           INITIAL STATE
        ===================================================== */

        updateSlide();

    }, 50);
}
// ============================================================
//  FACULTY RATINGS
// ============================================================
let currentHomeFaculty = '';
let homeRatingStar = 0;
let currentDetailFaculty = '';
let detailRatingStar = 0;

function getRatings() { return lsGet('facultyRatings', {}); }
function saveRatings(r) { lsSet('facultyRatings', r); }

function openRatingModal(facultyName) {
    currentHomeFaculty = facultyName;
    homeRatingStar = getRatings()[facultyName] || 0;
    document.getElementById('homeModalFacultyName').textContent = facultyName;
    paintStars('starContainer', homeRatingStar);
    document.getElementById('ratingModal').classList.add('active');
}
function closeRatingModal() { document.getElementById('ratingModal').classList.remove('active'); }
function submitRating() {
    if (homeRatingStar === 0) { showToast('⚠️ Please select a rating'); return; }
    const ratings = getRatings();
    ratings[currentHomeFaculty] = homeRatingStar;
    saveRatings(ratings);
    closeRatingModal();
    showToast(`⭐ Rated ${currentHomeFaculty} with ${homeRatingStar} stars!`);
}

function openFacultyDetail(facultyName) {
    const faculty = facultyData.find(f => f.name === facultyName);
    if (!faculty) return;
    currentDetailFaculty = facultyName;
    detailRatingStar = getRatings()[facultyName] || 0;
    document.getElementById('modalFacultyName').textContent = facultyName;
    document.getElementById('modalFacultySubject').textContent = faculty.subject;
    document.getElementById('modalFacultyDept').textContent = faculty.dept;
    document.getElementById('modalFacultyPhoto').textContent = faculty.photo;
    paintStars('starContainer2', detailRatingStar);
    document.getElementById('facultyDetailModal').classList.add('active');
}
function closeFacultyDetail() { document.getElementById('facultyDetailModal').classList.remove('active'); }
function submitFacultyRating() {
    if (detailRatingStar === 0) { showToast('⚠️ Please select a rating'); return; }
    const ratings = getRatings();
    ratings[currentDetailFaculty] = detailRatingStar;
    saveRatings(ratings);
    closeFacultyDetail();
    showToast(`⭐ Rated ${currentDetailFaculty} with ${detailRatingStar} stars!`);
}

function paintStars(containerId, value) {
    document.querySelectorAll('#' + containerId + ' .star').forEach(s => {
        const val = parseInt(s.dataset.value);
        s.classList.toggle('active', val <= value);
        s.textContent = val <= value ? '⭐' : '☆';
    });
}

document.addEventListener('click', function (e) {
    if (!e.target.classList.contains('star')) return;
    const container = e.target.closest('.stars');
    if (!container) return;
    const value = parseInt(e.target.dataset.value);
    paintStars(container.id, value);
    if (container.id === 'starContainer') homeRatingStar = value;
    else if (container.id === 'starContainer2') detailRatingStar = value;
});

// ============================================================
//  ABOUT DEVELOPER MODAL + MUSIC WIDGET
//  Music is scoped entirely to this modal: it attempts to
//  autoplay when the modal opens (falling back to "Tap play to
//  listen" if the browser blocks autoplay), and it pauses and
//  resets the moment the modal closes.
// ============================================================
let musicPlayerOpen = false;
let seekDragging = false;

function formatTime(sec) {
    if (isNaN(sec) || sec === Infinity) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

function setupMusicPlayer() {
    const audio = document.getElementById('aboutAudio');
    const icon = document.getElementById('aboutMusicIcon');
    const artwork = document.getElementById('musicArtwork');
    const playBtn = document.getElementById('musicPlayBtn');
    const seek = document.getElementById('musicSeek');
    const curTimeEl = document.getElementById('musicCurrentTime');
    const durEl = document.getElementById('musicDuration');
    const statusEl = document.getElementById('musicStatus');
    if (!audio) return;

    audio.addEventListener('loadedmetadata', () => {
        durEl.textContent = formatTime(audio.duration);
        seek.max = Math.floor(audio.duration) || 100;
    });
    audio.addEventListener('timeupdate', () => {
        curTimeEl.textContent = formatTime(audio.currentTime);
        if (!seekDragging) seek.value = Math.floor(audio.currentTime);
    });
    audio.addEventListener('play', () => {
        icon.classList.add('playing');
        artwork.classList.add('playing');
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        statusEl.textContent = 'Playing';
    });
    audio.addEventListener('pause', () => {
        icon.classList.remove('playing');
        artwork.classList.remove('playing');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        if (statusEl.textContent !== 'Tap play to listen') statusEl.textContent = 'Paused';
    });

    seek.addEventListener('mousedown', () => { seekDragging = true; });
    seek.addEventListener('touchstart', () => { seekDragging = true; });
    seek.addEventListener('input', () => { curTimeEl.textContent = formatTime(seek.value); });
    seek.addEventListener('change', () => {
        audio.currentTime = seek.value;
        seekDragging = false;
    });
}

function toggleMusicPlayer() {
    musicPlayerOpen = !musicPlayerOpen;
    document.getElementById('aboutMusicPlayer').classList.toggle('open', musicPlayerOpen);
}
function closeMusicPlayer() {
    musicPlayerOpen = false;
    document.getElementById('aboutMusicPlayer').classList.remove('open');
}
function toggleMusicPlayback() {
    const audio = document.getElementById('aboutAudio');
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
}

function showAboutDeveloper() {
    document.getElementById('aboutModal').classList.add('active');
    const audio = document.getElementById('aboutAudio');
    const statusEl = document.getElementById('musicStatus');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
            if (statusEl) statusEl.textContent = 'Tap play to listen';
        });
    }
}
function closeAboutModal() {
    document.getElementById('aboutModal').classList.remove('active');
    const audio = document.getElementById('aboutAudio');
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    closeMusicPlayer();
}

// ============================================================
//  TIMETABLE
// ============================================================
function showTimetable(branch, btn) {
    document.querySelectorAll('.timetable-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const container = document.getElementById('timetableContainer');

    if (branch === 'cse_a') {
        // Real Sem 3 Sec A timetable — restore it if a placeholder overwrote it
        container.innerHTML = `
            <div class="timetable-grid-wrap">
                <table class="timetable-grid">
                    <thead>
                        <tr><th>Day</th><th>9:00</th><th>9:55</th><th>11:00</th><th>11:55</th><th>2:15</th><th>3:10</th><th>4:05</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Mon</td><td>DSA</td><td>DSA</td><td>DDCO</td><td>OS</td><td colspan="3">DSL — A1 / GIT — A2</td></tr>
                        <tr><td>Tue</td><td>DDCO</td><td>JAVA</td><td>DSA</td><td>DSP</td><td colspan="3">DSL — A2 / GIT — A1</td></tr>
                        <tr><td>Wed</td><td>OS</td><td>JAVA</td><td>DSA</td><td>DDCO</td><td>DSP</td><td colspan="2">Community / Societal Project</td></tr>
                        <tr><td>Thu</td><td>JAVA</td><td>OS</td><td>DSP</td><td>DDCO</td><td colspan="2">OOPS Lab</td><td>Yoga</td></tr>
                        <tr><td>Fri</td><td>DSP</td><td>JAVA</td><td>OS</td><td>DDCO</td><td colspan="2">Library Visit</td><td>—</td></tr>
                        <tr><td>Sat</td><td>OS</td><td>DSA</td><td>JAVA</td><td>DSP</td><td>—</td><td>—</td><td>—</td></tr>
                    </tbody>
                </table>
            </div>
            <p class="timetable-note">Break 10:50–11:00 · Lunch 12:50–2:15 · Lab batches: A1 = 01–29, A2 = 30–58</p>`;
        return;
    }

    container.innerHTML = `
        <div class="placeholder-text">
            <i class="fas fa-image"></i>
            <p>📸 Timetable for <strong>${branch.toUpperCase()}</strong> not added yet</p>
            <p class="sub">Add ${branch}_timetable.jpg to /images/, or send the schedule and it can be added directly.</p>
        </div>`;
}

// ============================================================
//  TABS (Social Hub) / TOOL TABS (Academic Tools)
// ============================================================
function switchTab(panelId, btn) {
    const parent = btn.closest('.page-section');
    parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
    btn.classList.add('active');
}
function switchTool(panelId, btn) { switchTab(panelId, btn); }

// ============================================================
//  STUDY GROUPS
// ============================================================
function toggleGroup(btn) {
    const joined = btn.classList.contains('btn-secondary');
    btn.classList.toggle('btn-secondary', !joined);
    btn.classList.toggle('btn-primary', joined);
    btn.textContent = joined ? 'Join' : '✓ Joined';
    showToast(joined ? '👋 Left the group' : '🎉 Joined the group!');
}

// ============================================================
//  PLANNER / TASKS
// ============================================================
function addTask() {
    const title = document.getElementById('taskTitleInput').value.trim();
    if (!title) { showToast('⚠️ Enter a task title first'); return; }
    const subject = document.getElementById('taskSubjectInput').value;
    const priority = document.getElementById('taskPriorityInput').value;
    const date = document.getElementById('taskDateInput').value || 'No date';

    const list = document.getElementById('taskList');
    const priorityClass = priority.toLowerCase();
    const item = document.createElement('div');
    item.className = 'task-item';
    item.dataset.done = 'false';
    item.innerHTML = `
        <div class="task-check" onclick="toggleTask(this)"></div>
        <div class="task-body">
            <div class="task-title">${title}</div>
            <div class="task-meta"><span class="task-pill ${priorityClass}">${priority.toUpperCase()}</span><span>${subject}</span><span>${date}</span></div>
        </div>
        <button class="task-del" onclick="deleteTask(this)"><i class="fas fa-trash"></i></button>`;
    list.prepend(item);

    document.getElementById('taskTitleInput').value = '';
    updatePlannerProgress();
    showToast('✅ Task added');
}
function toggleTask(checkEl) {
    const item = checkEl.closest('.task-item');
    const done = item.dataset.done === 'true';
    item.dataset.done = (!done).toString();
    checkEl.classList.toggle('done', !done);
    checkEl.textContent = !done ? '✓' : '';
    item.querySelector('.task-title').classList.toggle('done', !done);
    updatePlannerProgress();
}
function deleteTask(btnEl) {
    btnEl.closest('.task-item').remove();
    updatePlannerProgress();
    showToast('🗑️ Task removed');
}
function setTaskFilter(filter, btn) {
    document.querySelectorAll('#page-planner .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#taskList .task-item').forEach(item => {
        const done = item.dataset.done === 'true';
        const show = filter === 'all' || (filter === 'done' && done) || (filter === 'pending' && !done);
        item.style.display = show ? 'flex' : 'none';
    });
}
function updatePlannerProgress() {
    const items = document.querySelectorAll('#taskList .task-item');
    const total = items.length;
    const done = document.querySelectorAll('#taskList .task-item[data-done="true"]').length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const fill = document.getElementById('plannerProgressFill');
    if (fill) fill.style.width = pct + '%';
    const label = document.getElementById('taskProgressLabel');
    if (label) label.textContent = `${done} / ${total} done`;
}

// ============================================================
//  NOTES (demo — Drive links only, no real file uploads)
// ============================================================
function toggleNoteForm() {
    const card = document.getElementById('noteFormCard');
    const isHidden = card.style.display === 'none' || card.style.display === '';
    card.style.display = isHidden ? 'block' : 'none';
    if (isHidden) document.getElementById('noteTitleInput').focus();
}

function addNote() {
    const title = document.getElementById('noteTitleInput').value.trim();
    const subject = document.getElementById('noteSubjectInput').value;
    const link = document.getElementById('noteLinkInput').value.trim();
    const desc = document.getElementById('noteDescInput').value.trim();

    if (!title) { showToast('⚠️ Give the note a title first'); return; }
    if (!link) { showToast('⚠️ Paste a Google Drive link first'); return; }

    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const grid = document.getElementById('notesGrid');
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
        <div class="note-card-top">
            <span class="note-subject-tag">${subject}</span>
            <button class="note-del" onclick="deleteNote(this)" title="Remove"><i class="fas fa-times"></i></button>
        </div>
        <div class="note-title">${title}</div>
        ${desc ? `<div class="note-desc">${desc}</div>` : ''}
        <div class="note-card-footer">
            <span class="note-date">Added ${today}</span>
            <a class="note-drive-link" href="${link}" target="_blank"><i class="fab fa-google-drive"></i> Open</a>
        </div>`;
    grid.prepend(card);

    document.getElementById('noteTitleInput').value = '';
    document.getElementById('noteLinkInput').value = '';
    document.getElementById('noteDescInput').value = '';
    toggleNoteForm();
    showToast('📝 Note added');
}

function deleteNote(btn) {
    btn.closest('.note-card').remove();
    showToast('🗑️ Note removed');
}

// ============================================================
//  ACADEMIC TOOLS — GPA CALCULATOR
// ============================================================
function addGpaRow() {
    const wrap = document.getElementById('gpaRows');

    const row = document.createElement('div');
    row.className = 'gpa-row';

    row.innerHTML = `
        <input
            type="text"
            placeholder="Subject">

        <input
            type="number"
            value="4"
            min="1"
            max="6">

        <input
            type="number"
            value="0"
            min="0"
            max="100"
            placeholder="Marks">

        <button
            class="gpa-del"
            onclick="removeGpaRow(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    wrap.appendChild(row);
    calcGpa();
}


function removeGpaRow(btn) {
    btn.closest('.gpa-row').remove();
    calcGpa();
}


function calcGpa() {

    const rows =
        document.querySelectorAll('#gpaRows .gpa-row');

    let totalCredits = 0;
    let totalPoints = 0;

    rows.forEach(row => {

        const inputs =
            row.querySelectorAll('input');

        const credit =
            parseFloat(inputs[1]?.value) || 0;

        const marks =
            parseFloat(inputs[2]?.value) || 0;

        let gradePoint = 0;

        // Convert marks to grade points
        if (marks >= 90) {
            gradePoint = 10;
        } else if (marks >= 80) {
            gradePoint = 9;
        } else if (marks >= 70) {
            gradePoint = 8;
        } else if (marks >= 60) {
            gradePoint = 7;
        } else if (marks >= 50) {
            gradePoint = 6;
        } else if (marks >= 40) {
            gradePoint = 5;
        } else {
            gradePoint = 0;
        }

        totalCredits += credit;
        totalPoints += credit * gradePoint;
    });

    const sgpa =
        totalCredits
            ? (totalPoints / totalCredits).toFixed(2)
            : '--';

    const resultEl =
        document.getElementById('gpaResult');

    if (resultEl) {
        resultEl.textContent = sgpa;
    }
}


// Recalculate when marks or credits are changed
document.addEventListener('input', function (e) {

    if (e.target.closest('#gpaRows')) {
        calcGpa();
    }

});


// Recalculate when a value changes
document.addEventListener('change', function (e) {

    if (e.target.closest('#gpaRows')) {
        calcGpa();
    }

});

// ============================================================
//  ACADEMIC TOOLS — ATTENDANCE WHAT-IF
// ============================================================
function calcWhatIf() {
    const conducted = parseFloat(document.getElementById('wiConducted').value) || 0;
    const attended = parseFloat(document.getElementById('wiAttended').value) || 0;
    const target = parseFloat(document.getElementById('wiTarget').value) || 85;
    const future = parseFloat(document.getElementById('wiFuture').value) || 0;

    const totalFuture = conducted + future;
    const needed = Math.ceil((target / 100) * totalFuture - attended);
    const box = document.getElementById('whatifResultBox');
    const currentPct = conducted ? (attended / conducted * 100).toFixed(1) : '0.0';

    if (needed <= 0) {
        const bunkable = Math.max(Math.floor(attended - (target / 100) * totalFuture), 0);
        box.innerHTML = `<div class="result-number">${bunkable}</div><div class="result-label">You can skip up to ${bunkable} of the next ${future} classes and stay at ${target}%+ (currently ${currentPct}%)</div>`;
    } else if (needed > future) {
        box.innerHTML = `<div class="result-number">⚠️</div><div class="result-label">Even attending all ${future} remaining classes won't reach ${target}% this term (currently ${currentPct}%)</div>`;
    } else {
        box.innerHTML = `<div class="result-number">${needed}</div><div class="result-label">Attend at least ${needed} of the next ${future} classes to reach ${target}% (currently ${currentPct}%)</div>`;
    }
}

// ============================================================
//  ACADEMIC TOOLS — EXAM COUNTDOWN
// ============================================================
let countdownTargetDate = examDates[0].date;
let countdownInterval = null;

function setCountdownExam(name, dateStr, btn) {
    document.querySelectorAll('#toolExam .timetable-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    countdownTargetDate = dateStr;
    document.getElementById('countdownCaption').textContent = `⏳ Countdown to ${name}`;
    updateCountdown();
}
function updateCountdown() {
    const target = new Date(countdownTargetDate).getTime();
    const now = Date.now();
    let diff = Math.max(target - now, 0);
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, '0'); };
    set('cdDays', d); set('cdHours', h); set('cdMins', m); set('cdSecs', s);
}

// ============================================================
//  SETTINGS
// ============================================================
function toggleNotifications() {
    const btn = document.getElementById('notifToggleBtn');
    const enabled = btn.textContent.trim() === 'Disable';
    btn.textContent = enabled ? 'Enable' : 'Disable';
    lsSet('notificationsEnabled', !enabled);
    showToast(`🔔 Notifications ${!enabled ? 'enabled' : 'disabled'}`);
}

// ============================================================
//  POMODORO TIMER (own page, fully functional)
// ============================================================
const POMO_DURATIONS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const POMO_CIRCUMFERENCE = 597;

let pomoState = {
    mode: 'focus', secondsLeft: 25 * 60, totalSeconds: 25 * 60,
    isRunning: false, isPaused: false, timerId: null, focusMinutes: 25,
    sessions: [], sessionsToday: 0, totalFocusMinutes: 0, streak: 0, lastDate: null
};

function pomoLoadState() {
    const saved = lsGet('pomodoroState', null);
    if (saved) pomoState = { ...pomoState, ...saved, timerId: null, isRunning: false };
    POMO_DURATIONS.focus = (pomoState.focusMinutes || 25) * 60;
}
function pomoSaveState() {
    const toSave = { ...pomoState };
    delete toSave.timerId;
    lsSet('pomodoroState', toSave);
}
function pomoSyncModeButtons() {
    document.querySelectorAll('.pomo-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === pomoState.mode));
    const row = document.getElementById('pomoDurationRow');
    if (row) row.style.display = pomoState.mode === 'focus' ? 'flex' : 'none';
}
function pomoSyncDurationButtons() {
    document.querySelectorAll('.pomo-duration-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.mins) === pomoState.focusMinutes));
}
function pomoSetFocusDuration(mins, btn) {
    if (pomoState.isRunning) {
        if (!confirm('Timer is running. Reset and change focus length?')) return;
        pomoStop();
    }
    pomoState.focusMinutes = mins;
    POMO_DURATIONS.focus = mins * 60;
    pomoSyncDurationButtons();
    if (pomoState.mode === 'focus') {
        pomoState.secondsLeft = POMO_DURATIONS.focus;
        pomoState.totalSeconds = POMO_DURATIONS.focus;
        pomoUpdateUI();
    }
    pomoSaveState();
    showToast(`🎯 Focus length set to ${mins} minutes`);
}
function pomoSetMode(mode) {
    if (pomoState.isRunning) {
        if (!confirm('Timer is running. Reset and switch mode?')) return;
        pomoStop();
    }
    pomoState.mode = mode;
    pomoState.secondsLeft = POMO_DURATIONS[mode];
    pomoState.totalSeconds = POMO_DURATIONS[mode];
    pomoSyncModeButtons();
    pomoUpdateUI();
    pomoSaveState();
}
function pomoToggle() { pomoState.isRunning ? pomoPause() : pomoStart(); }
function pomoStart() {
    if (pomoState.secondsLeft <= 0) { pomoReset(); return; }
    pomoState.isRunning = true;
    pomoState.isPaused = false;
    document.getElementById('pomoStartBtn').innerHTML = '<i class="fas fa-pause"></i>';
    pomoState.timerId = setInterval(pomoTick, 1000);
    pomoUpdateUI();
}
function pomoPause() {
    pomoState.isRunning = false;
    pomoState.isPaused = true;
    clearInterval(pomoState.timerId);
    document.getElementById('pomoStartBtn').innerHTML = '<i class="fas fa-play"></i>';
    pomoUpdateUI();
}
function pomoStop() {
    pomoState.isRunning = false;
    pomoState.isPaused = false;
    clearInterval(pomoState.timerId);
    const btn = document.getElementById('pomoStartBtn');
    if (btn) btn.innerHTML = '<i class="fas fa-play"></i>';
}
function pomoReset() {
    pomoStop();
    pomoState.secondsLeft = POMO_DURATIONS[pomoState.mode];
    pomoState.totalSeconds = POMO_DURATIONS[pomoState.mode];
    pomoUpdateUI();
    pomoSaveState();
}
function pomoSkip() { pomoState.isRunning ? pomoCompleteSession() : pomoReset(); }
function pomoTick() {
    pomoState.secondsLeft--;
    pomoUpdateUI();
    if (pomoState.secondsLeft <= 0) pomoCompleteSession();
}
function pomoCompleteSession() {
    pomoStop();
    const modeLabel = pomoState.mode === 'focus' ? 'Focus' : pomoState.mode === 'short' ? 'Short Break' : 'Long Break';
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    pomoState.sessions.unshift({ type: pomoState.mode, label: modeLabel, time: timeStr, duration: POMO_DURATIONS[pomoState.mode] / 60 });
    if (pomoState.sessions.length > 50) pomoState.sessions.pop();

    if (pomoState.mode === 'focus') {
        pomoState.sessionsToday++;
        pomoState.totalFocusMinutes += POMO_DURATIONS.focus / 60;
        pomoUpdateStreak();
    }

    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880; osc.type = 'sine'; gain.gain.value = 0.15;
        osc.start(); setTimeout(() => osc.stop(), 300);
    } catch (e) { /* ignore */ }

    pomoState.mode = pomoState.mode === 'focus' ? 'short' : 'focus';
    pomoSyncModeButtons();
    pomoState.secondsLeft = POMO_DURATIONS[pomoState.mode];
    pomoState.totalSeconds = POMO_DURATIONS[pomoState.mode];

    pomoUpdateUI();
    pomoUpdateStats();
    pomoRenderHistory();
    pomoSaveState();

    showToast(pomoState.mode === 'short' ? '🎯 Focus session complete! Starting short break.' : '☕ Break over! Ready to focus again?');
}
function pomoUpdateStreak() {
    const today = new Date().toDateString();
    if (!pomoState.lastDate) pomoState.streak = 1;
    else if (pomoState.lastDate !== today) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        pomoState.streak = (pomoState.lastDate === yesterday.toDateString()) ? pomoState.streak + 1 : 1;
    }
    pomoState.lastDate = today;
}
function pomoUpdateUI() {
    const timeEl = document.getElementById('pomoTimeDisplay');
    if (!timeEl) return;
    const mins = Math.floor(pomoState.secondsLeft / 60), secs = pomoState.secondsLeft % 60;
    timeEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const progress = 1 - (pomoState.secondsLeft / pomoState.totalSeconds);
    document.getElementById('pomoProgress').style.strokeDashoffset = POMO_CIRCUMFERENCE * progress;

    const labels = { focus: '🎯 Focus Time', short: '☕ Short Break', long: '🛋️ Long Break' };
    document.getElementById('pomoStatusLabel').textContent = labels[pomoState.mode];

    const badge = document.getElementById('pomoStatusBadge');
    const badgeLabels = { focus: 'Focus', short: 'Break', long: 'Long Break' };
    badge.textContent = badgeLabels[pomoState.mode];
    badge.className = 'pomo-status-badge ' + (pomoState.mode === 'focus' ? 'focus' : 'break');
    if (pomoState.isPaused) { badge.textContent = '⏸️ Paused'; badge.className = 'pomo-status-badge paused'; }

    document.getElementById('pomoProgress').style.stroke = pomoState.mode === 'focus' ? '#4f7df3' : '#10b981';
}
function pomoUpdateStats() {
    document.getElementById('pomoSessionsToday').textContent = pomoState.sessionsToday || 0;
    document.getElementById('pomoTotalFocus').textContent = (pomoState.totalFocusMinutes || 0) + 'm';
    document.getElementById('pomoStreak').textContent = pomoState.streak || 0;
}
function pomoRenderHistory() {
    const el = document.getElementById('pomoSessionList');
    if (!el) return;
    if (!pomoState.sessions.length) {
        el.innerHTML = '<div class="pomo-empty-sessions">No sessions yet. Start your first focus session! 🚀</div>';
        return;
    }
    el.innerHTML = pomoState.sessions.slice(0, 15).map(s => {
        const cls = s.type === 'focus' ? 'focus' : 'break';
        const icon = s.type === 'focus' ? '🎯' : '☕';
        return `<div class="pomo-session-item"><span class="session-type ${cls}">${icon} ${s.label}</span><span class="session-time">${s.time} · ${s.duration}m</span></div>`;
    }).join('');
}
function pomoClearHistory() {
    if (!pomoState.sessions.length) return;
    if (confirm('Clear all session history?')) {
        pomoState.sessions = [];
        pomoRenderHistory();
        pomoSaveState();
        showToast('🗑️ History cleared');
    }
}
document.addEventListener('keydown', function (e) {
    const page = document.getElementById('page-pomodoro');
    if (!page || !page.classList.contains('active')) return;
    if (e.key === ' ' || e.key === 'Space') { e.preventDefault(); pomoToggle(); }
    if (e.key === 'r') pomoReset();
});

// ============================================================
//  PROGRESS BAR WIDTHS
//  Elements like .fill, .goal-fill, .compare-bar-fill and
//  .planner-progress-fill carry a data-target="NN" attribute
//  that becomes their width.
// ============================================================
function initProgressBars() {
    document.querySelectorAll('[data-target]').forEach(el => {
        const target = el.getAttribute('data-target');
        if (target !== null) {
            requestAnimationFrame(() => { el.style.width = target + '%'; });
        }
    });
}

// ============================================================
//  ELEVENNOTES PRO MODAL
// ============================================================
function openProModal() {
    const modal = document.getElementById('proModal');
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeProModal() {
    const modal = document.getElementById('proModal');
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// ============================================================
//  ELEVENNOTES FEEDBACK MODAL
// ============================================================
let selectedFeedbackType = 'Suggestion';

function openFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// ============================================================
//  ELEVENNOTES PROFILE AVATAR SYSTEM
// ============================================================
function openAvatarPicker() {
    const picker = document.getElementById('avatarPicker');
    if (!picker) return;
    picker.classList.add('show');
    updateSelectedAvatar();
}

function closeAvatarPicker() {
    const picker = document.getElementById('avatarPicker');
    if (!picker) return;
    picker.classList.remove('show');
}

function selectAvatar(button) {
    if (!button) return;
    const avatarPath = button.dataset.avatar;
    if (!avatarPath) return;

    const profileImage = document.getElementById('profileAvatarImg');
    if (profileImage) profileImage.src = avatarPath;

    // Keep the sidebar avatar in sync with the profile page avatar
    const sidebarImage = document.getElementById('sidebarAvatarImg');
    if (sidebarImage) sidebarImage.src = avatarPath;

    lsSet('profileAvatar', avatarPath);

    document.querySelectorAll('.avatar-option').forEach(option => option.classList.remove('selected'));
    button.classList.add('selected');

    showToast('✅ Profile picture updated');
}

function updateSelectedAvatar() {
    const savedAvatar = lsGet('profileAvatar', 'images/avatar-boy-1.jpeg');

    const profileImage = document.getElementById('profileAvatarImg');
    if (profileImage) profileImage.src = savedAvatar;

    // Keep the sidebar avatar in sync with the profile page avatar
    const sidebarImage = document.getElementById('sidebarAvatarImg');
    if (sidebarImage) sidebarImage.src = savedAvatar;

    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.avatar === savedAvatar);
    });
}

// ============================================================
//  ELEVENNOTES PROFILE + IDENTITY SYSTEM
//  Name, USN and bio are chosen by the student and stored only
//  in this browser (LocalStorage). Defaults are neutral.
// ============================================================
const DEFAULT_NAME = 'Student';
const DEFAULT_BIO = 'CSE Student | Tech Enthusiast | Building the future 🚀';

function applyIdentity() {
    const name = lsGet('profileName', DEFAULT_NAME);
    const usn = lsGet('profileUsn', '');

    const profileName = document.querySelector('.profile-name');
    if (profileName) profileName.textContent = name;

    const profileUsn = document.getElementById('profileUsn');
    if (profileUsn) profileUsn.textContent = usn || 'Add your USN';

    const header = document.getElementById('headerSubtitle');
    if (header) header.textContent = usn ? `${name} · ${usn}` : `${name} · Add your USN in Profile`;

    const sidebarName = document.querySelector('.sidebar-user .name');
    if (sidebarName) sidebarName.textContent = name.toUpperCase();

    const sidebarUsn = document.getElementById('sidebarUsn');
    if (sidebarUsn) sidebarUsn.textContent = usn || 'Add your USN in Profile';
}

function editProfile() {
    const modal = document.getElementById('editProfileModal');
    const nameInput = document.getElementById('editProfileName');
    const usnInput = document.getElementById('editProfileUsn');
    const bioInput = document.getElementById('editProfileBio');
    if (!modal || !nameInput || !bioInput) return;

    nameInput.value = lsGet('profileName', DEFAULT_NAME);
    if (usnInput) usnInput.value = lsGet('profileUsn', '');
    bioInput.value = lsGet('profileBio', DEFAULT_BIO);

    updateBioCharacterCount();
    modal.classList.add('show');
}

function closeEditProfile() {
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.classList.remove('show');
}

function saveProfileChanges() {
    const nameInput = document.getElementById('editProfileName');
    const usnInput = document.getElementById('editProfileUsn');
    const bioInput = document.getElementById('editProfileBio');
    if (!nameInput || !bioInput) return;

    const profileName = nameInput.value.trim();
    const profileUsn = usnInput ? usnInput.value.trim().toUpperCase() : '';
    const profileBio = bioInput.value.trim();

    if (!profileName) {
        showToast('⚠️ Please enter your name');
        nameInput.focus();
        return;
    }
    if (!profileBio) {
        showToast('⚠️ Please enter a bio');
        bioInput.focus();
        return;
    }

    lsSet('profileName', profileName);
    lsSet('profileUsn', profileUsn);
    lsSet('profileBio', profileBio);

    const bioElement = document.querySelector('.profile-bio');
    if (bioElement) bioElement.textContent = profileBio;
    applyIdentity();

    closeEditProfile();
    showToast('✅ Profile updated successfully');
}

function updateBioCharacterCount() {
    const bioInput = document.getElementById('editProfileBio');
    const counter = document.getElementById('bioCharCount');
    if (!bioInput || !counter) return;
    counter.textContent = bioInput.value.length;
}

function loadSavedProfile() {
    applyIdentity();
    const savedBio = lsGet('profileBio', null);
    if (savedBio) {
        const bioElement = document.querySelector('.profile-bio');
        if (bioElement) bioElement.textContent = savedBio;
    }
}

document.addEventListener('input', function (event) {
    if (event.target && event.target.id === 'editProfileBio') updateBioCharacterCount();
});

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    loadTheme();
    loadSavedProfile();
    updateSelectedAvatar();


    initProgressBars();
    updatePlannerProgress();
    calcGpa();
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
    setupMusicPlayer();

    pomoLoadState();
    pomoSyncModeButtons();
    pomoSyncDurationButtons();
    pomoUpdateUI();
    pomoUpdateStats();
    pomoRenderHistory();


    // Click-outside-to-close for the classic modals
    const overlayCloseHandlers = {
        aboutModal: closeAboutModal,
        ratingModal: closeRatingModal,
        facultyDetailModal: closeFacultyDetail,
        detailModal: closeModal
    };
    Object.keys(overlayCloseHandlers).forEach(id => {
        const overlay = document.getElementById(id);
        if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) overlayCloseHandlers[id](); });
    });

    // ---------- Pro modal ----------
    const proTrigger = document.getElementById('proTrigger');
    const proModal = document.getElementById('proModal');
    const proModalClose = document.getElementById('proModalClose');
    const proGotIt = document.getElementById('proGotIt');

    if (proTrigger) proTrigger.addEventListener('click', openProModal);
    if (proModalClose) proModalClose.addEventListener('click', closeProModal);
    if (proGotIt) proGotIt.addEventListener('click', closeProModal);
    if (proModal) proModal.addEventListener('click', (e) => { if (e.target === proModal) closeProModal(); });

    // ---------- Feedback modal ----------
    const feedbackTrigger = document.getElementById('feedbackTrigger');
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackClose = document.getElementById('feedbackClose');
    const feedbackCancel = document.getElementById('feedbackCancel');
    const feedbackSubmit = document.getElementById('feedbackSubmit');
    const feedbackText = document.getElementById('feedbackText');
    const feedbackCharCount = document.getElementById('feedbackCharCount');
    const feedbackTypes = document.querySelectorAll('.feedback-type');

    if (feedbackTrigger) {
        feedbackTrigger.addEventListener('click', (e) => { e.preventDefault(); openFeedbackModal(); });
    }
    if (feedbackClose) feedbackClose.addEventListener('click', closeFeedbackModal);
    if (feedbackCancel) feedbackCancel.addEventListener('click', closeFeedbackModal);

    feedbackTypes.forEach(function (button) {
        button.addEventListener('click', function () {
            feedbackTypes.forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            selectedFeedbackType = button.dataset.feedbackType;
        });
    });

    if (feedbackText) {
        feedbackText.addEventListener('input', function () {
            if (feedbackCharCount) feedbackCharCount.textContent = feedbackText.value.length;
        });
    }

    if (feedbackSubmit) {
        feedbackSubmit.addEventListener('click', function () {
            const message = feedbackText ? feedbackText.value.trim() : '';
            if (!message) {
                if (feedbackText) feedbackText.focus();
                return;
            }
            window.open('https://forms.gle/qynARnBJsS2odeTd8', '_blank');
        });
    }

    if (feedbackModal) {
        feedbackModal.addEventListener('click', (e) => { if (e.target === feedbackModal) closeFeedbackModal(); });
    }

    // ---------- ESC closes Pro / Feedback modals ----------
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (proModal && proModal.classList.contains('show')) closeProModal();
        if (feedbackModal && feedbackModal.classList.contains('show')) closeFeedbackModal();
    });

    console.log('📘 ElevenNotes ready — all local, no network calls.');
});

// ============================================================
//  EXPOSE GLOBALLY (for inline onclick="..." handlers)
// ============================================================
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.showPage = showPage;
window.scrollToSection = scrollToSection;
window.toggleTheme = toggleTheme;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.showStreakDetails = showStreakDetails;
window.closeStreakDetails = closeStreakDetails;
window.showAllSubjects = showAllSubjects;
window.showCollegeEvents = showCollegeEvents;
window.openRatingModal = openRatingModal;
window.closeRatingModal = closeRatingModal;
window.submitRating = submitRating;
window.openFacultyDetail = openFacultyDetail;
window.closeFacultyDetail = closeFacultyDetail;
window.submitFacultyRating = submitFacultyRating;
window.showAboutDeveloper = showAboutDeveloper;
window.closeAboutModal = closeAboutModal;
window.toggleMusicPlayer = toggleMusicPlayer;
window.closeMusicPlayer = closeMusicPlayer;
window.toggleMusicPlayback = toggleMusicPlayback;
window.showTimetable = showTimetable;
window.editProfile = editProfile;
window.closeEditProfile = closeEditProfile;
window.saveProfileChanges = saveProfileChanges;
window.openAvatarPicker = openAvatarPicker;
window.closeAvatarPicker = closeAvatarPicker;
window.selectAvatar = selectAvatar;
window.openProModal = openProModal;
window.closeProModal = closeProModal;
window.openFeedbackModal = openFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;
window.switchTab = switchTab;
window.switchTool = switchTool;
window.toggleGroup = toggleGroup;
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.setTaskFilter = setTaskFilter;
window.toggleNoteForm = toggleNoteForm;
window.addNote = addNote;
window.deleteNote = deleteNote;
window.addGpaRow = addGpaRow;
window.removeGpaRow = removeGpaRow;
window.calcGpa = calcGpa;
window.calcWhatIf = calcWhatIf;
window.setCountdownExam = setCountdownExam;
window.toggleNotifications = toggleNotifications;
window.pomoSetMode = pomoSetMode;
window.pomoSetFocusDuration = pomoSetFocusDuration;
window.pomoToggle = pomoToggle;
window.pomoReset = pomoReset;
window.pomoSkip = pomoSkip;
window.pomoClearHistory = pomoClearHistory;
