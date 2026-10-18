// ============================================================
//  APP.JS — ElevenNotes
//  Everything is saved only in this browser (LocalStorage).
//  No accounts, no server, no outside connections.
// ============================================================
(function () {
    'use strict';

    // ---------- helpers ----------
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pad = n => String(n).padStart(2, '0');
    const KEY = 'elevenNotes_';
    const get = (k, d) => { try { const v = localStorage.getItem(KEY + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
    const set = (k, v) => { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } };
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const SUB = Object.fromEntries(SUBJECTS.map(s => [s.id, s]));
    const DAYS = [null, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function fmtTime(min) {
        const h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? 'PM' : 'AM';
        return `${((h + 11) % 12) + 1}:${pad(m)} ${ap}`;
    }

    // ---------- state ----------
    const defaultProfile = { name: 'Student', usn: '', bio: 'CSE student. Building the future.', avatar: 'images/avatar-boy-1.jpeg' };
    const S = {
        profile: Object.assign({}, defaultProfile, get('profile', {})),
        tasks: get('tasks', []),
        notes: get('notes', []),
        ratings: get('ratings', {}),
        circles: get('circles', {}),
        stats: Object.assign({ tasksDone: 0, focusSessions: 0, focusMinutes: 0, notesAdded: 0, sgpaUsed: false, whatifUsed: false, darkTried: false, bonusXp: 0, visits: [] }, get('stats', {})),
        daily: get('daily', {}),
        seen: get('seen', []),
        customExams: get('customExams', []),
        sgpa: get('sgpa', null),
        focusMin: get('focusMin', 25),
        sessions: get('sessions', [])
    };
    const ui = { studyTab: 'subjects', day: 0, noteFilter: 'all', planFilter: 'all', exam: 'last' };

    const save = k => set(k, S[k]);

    // ---------- toast & sheet ----------
    let toastTimer;
    function toast(msg) {
        const t = $('#toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
    }

    let lastFocus = null;
    function openSheet(title, html) {
        lastFocus = document.activeElement;
        $('#sheetTitle').textContent = title;
        $('#sheetBody').innerHTML = html;
        $('#sheetWrap').classList.add('open');
        $('#sheetWrap').setAttribute('aria-hidden', 'false');
        document.body.classList.add('lock');
        const first = $('#sheetBody input, #sheetBody textarea, #sheetBody select');
        if (first && window.matchMedia('(pointer: fine)').matches) first.focus();
    }
    function closeSheet() {
        $('#sheetWrap').classList.remove('open');
        $('#sheetWrap').setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lock');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    // ---------- progress, XP, badges ----------
    function calcStreak() {
        const seen = new Set(S.stats.visits);
        const d = new Date();
        let n = 0;
        while (seen.has(dkey(d))) { n++; d.setDate(d.getDate() - 1); }
        return n;
    }
    function derived() {
        return Object.assign({}, S.stats, {
            rated: Object.values(S.ratings).filter(Boolean).length,
            circles: Object.values(S.circles).filter(Boolean).length,
            streak: calcStreak(),
            profileDone: S.profile.name !== 'Student' && !!S.profile.usn
        });
    }
    function xpTotal() {
        const d = derived();
        return d.tasksDone * 10 + d.focusSessions * 20 + d.notesAdded * 10 + d.rated * 5 + d.visits.length * 5 + d.bonusXp;
    }
    function levelInfo() {
        const xp = xpTotal(), lvl = Math.floor(xp / 100) + 1;
        return { xp, lvl, into: xp % 100, title: LEVELS[Math.min(lvl - 1, LEVELS.length - 1)] };
    }
    function today() {
        const k = dkey();
        if (!S.daily || S.daily.date !== k) { S.daily = { date: k, tasksDone: 0, focusSessions: 0, added: 0, claimed: [] }; save('daily'); }
        return S.daily;
    }
    function checkProgress() {
        const d = today(), s = derived();
        CHALLENGES.forEach(c => {
            if (c.val(d) >= c.goal && !d.claimed.includes(c.id)) {
                d.claimed.push(c.id);
                S.stats.bonusXp += c.xp;
                toast(`Challenge done: ${c.text}. +${c.xp} XP`);
            }
        });
        save('daily'); save('stats');
        const earned = BADGES.filter(b => b.val(derived()) >= b.goal).map(b => b.id);
        const fresh = earned.filter(id => !S.seen.includes(id));
        if (fresh.length) {
            S.seen = S.seen.concat(fresh); save('seen');
            const b = BADGES.find(x => x.id === fresh[0]);
            setTimeout(() => toast(`New badge: ${b.icon} ${b.name}`), 400);
        }
    }
    function bump(field, n = 1, dailyField) {
        S.stats[field] += n;
        if (dailyField) today()[dailyField] += 1;
        save('stats'); save('daily');
        checkProgress();
    }

    // ---------- timetable helpers ----------
    function entryInfo(e) {
        if (e.sub) { const s = SUB[e.sub]; return { title: s.name, sub: s.faculty, kind: s.kind }; }
        return { title: e.title, sub: e.detail, kind: e.kind || 'free' };
    }
    function dueInfo(d) {
        if (!d) return null;
        const t = new Date(d + 'T00:00:00'), t0 = new Date(); t0.setHours(0, 0, 0, 0);
        const diff = Math.round((t - t0) / 864e5);
        if (diff < 0) return { text: `Overdue by ${-diff} day${diff === -1 ? '' : 's'}`, late: true };
        if (diff === 0) return { text: 'Due today' };
        if (diff === 1) return { text: 'Due tomorrow' };
        if (diff < 7) return { text: `Due in ${diff} days` };
        return { text: 'Due ' + t.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) };
    }
    const examList = () => EXAMS.concat(S.customExams);
    function nextExam() {
        const t0 = new Date(); t0.setHours(0, 0, 0, 0);
        return examList().map(e => ({ e, days: Math.round((new Date(e.date + 'T00:00:00') - t0) / 864e5) }))
            .filter(x => x.days >= 0).sort((a, b) => a.days - b.days)[0] || null;
    }

    // ============================================================
    //  PAGES
    // ============================================================
    const R = {};

    // ---------- HOME ----------
    R.home = function () {
        const now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
        const h = now.getHours();
        const greet = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night';
        const named = S.profile.name !== 'Student';
        const first = S.profile.name.split(' ')[0];
        const list = TIMETABLE[now.getDay()] || [];
        const nextIdx = list.findIndex(e => e.t > nowMin);
        const classes = list.map((e, i) => {
            const info = entryInfo(e), end = e.t + e.n * PERIOD_MIN;
            const cur = nowMin >= e.t && nowMin < end, past = nowMin >= end, nxt = i === nextIdx;
            const cls = cur ? 'now' : nxt ? 'next' : past ? 'past' : '';
            const tag = cur ? '<span class="tag">Now</span>' : nxt ? '<span class="tag">Up next</span>' : '';
            const title = (cur || nxt) ? `<span class="hl">${esc(info.title)}</span>` : esc(info.title);
            return `<li class="cls ${cls}"><div class="cls-time">${fmtTime(e.t)}</div><div><div class="cls-title">${title}${tag}</div><div class="cls-sub">${esc(info.sub)}</div></div></li>`;
        }).join('');
        const sheet = list.length
            ? `<ul class="classes">${classes}</ul>`
            : `<div class="empty"><b>No classes today</b>Enjoy the break, or get ahead on your tasks.</div>`;

        const pending = S.tasks.filter(t => !t.done);
        const soon = pending.filter(t => t.date).sort((a, b) => a.date.localeCompare(b.date))[0];
        const ne = nextExam(), d = today();
        const doneCh = CHALLENGES.filter(c => c.val(d) >= c.goal).length;

        $('#page-home').innerHTML = `
            <h1 class="hello">${greet}${named ? ', ' + esc(first) : ''}<small>${named ? 'Here is your day.' : 'Add your name in the Me tab to personalise this.'}</small></h1>
            <div class="today">
                <div class="today-top">
                    <div class="date-big"><b>${now.getDate()}</b><span>${now.toLocaleDateString('en-IN', { weekday: 'short' })}<br>${now.toLocaleDateString('en-IN', { month: 'short' })}</span></div>
                    <div class="streak-chip">🔥 ${Math.max(calcStreak(), 1)} day streak</div>
                </div>
                ${sheet}
            </div>
            <div class="flat">
                <button data-act="nav" data-to="plan"><span class="em">📋</span><span class="grow"><b>${pending.length ? pending.length + ' task' + (pending.length > 1 ? 's' : '') + ' to do' : 'Nothing pending'}</b><span>${soon ? esc(soon.title) + ', ' + dueInfo(soon.date).text.toLowerCase() : (pending.length ? 'Open your list' : 'Add a task to plan your week')}</span></span><span class="go">›</span></button>
                ${ne ? `<button data-act="tool" data-tab="count" data-exam="${esc(ne.e.id)}"><span class="em">⏳</span><span class="grow"><b>${ne.days === 0 ? 'Today: ' : ne.days + (ne.days === 1 ? ' day to ' : ' days to ')}${esc(ne.e.name)}</b><span>Open the countdown</span></span><span class="go">›</span></button>` : ''}
                <button data-act="nav" data-to="me"><span class="em">🎯</span><span class="grow"><b>Today's challenges: ${doneCh} of ${CHALLENGES.length}</b><span>Finish them to earn XP and badges</span></span><span class="go">›</span></button>
            </div>
            <h2 class="sec-title">Jump to</h2>
            <div class="tiles">
                <button class="tile" data-act="nav" data-to="faculty"><span>👩‍🏫</span>Faculty</button>
                <button class="tile" data-act="study-tab" data-tab="notes"><span>📝</span>Notes</button>
                <button class="tile" data-act="tool" data-tab="focus"><span>🍅</span>Focus</button>
                <button class="tile" data-act="tool" data-tab="sgpa"><span>🎓</span>SGPA</button>
                <button class="tile" data-act="nav" data-to="events"><span>🎉</span>Events</button>
                <button class="tile" data-act="nav" data-to="community"><span>💬</span>Community</button>
            </div>`;
    };

    // ---------- STUDY ----------
    R.study = function () {
        const tabs = [['subjects', 'Subjects'], ['timetable', 'Timetable'], ['notes', 'Notes']];
        let body = '';
        if (ui.studyTab === 'subjects') {
            body = `<div class="flat">${SUBJECTS.map(s => `
                <button data-act="subject" data-id="${s.id}">
                    <span class="code-chip ${s.kind}">${s.id}</span>
                    <span class="grow"><b>${esc(s.name)}</b><span>${esc(s.faculty)}</span></span><span class="go">›</span>
                </button>`).join('')}</div>
                <p class="fine">${SUBJECTS.length} subjects, Semester 3. Tap a subject to rate the faculty or add a note or task.</p>`;
        } else if (ui.studyTab === 'timetable') {
            const dow = new Date().getDay(), todayIdx = dow === 0 ? 1 : dow;
            if (!ui.day) ui.day = todayIdx;
            const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
            const list = TIMETABLE[ui.day] || [];
            body = `<div class="day-chips" role="tablist">${[1, 2, 3, 4, 5, 6].map(d => `<button class="chip ${ui.day === d ? 'on' : ''}" data-act="day" data-d="${d}">${DAYS[d]}${d === dow ? ' •' : ''}</button>`).join('')}</div>
                <div class="flat">${list.map(e => {
                    const info = entryInfo(e), end = e.t + e.n * PERIOD_MIN;
                    const live = ui.day === dow && nowMin >= e.t && nowMin < end;
                    return `<div class="row"><span class="code-chip ${info.kind}" style="min-width:76px">${fmtTime(e.t)}</span><span class="grow"><b>${live ? `<span class="hl">${esc(info.title)}</span><span class="tag">Now</span>` : esc(info.title)}</b><span>${esc(info.sub)}</span></span></div>`;
                }).join('')}</div>
                <p class="fine">Section A. Break 10:50 to 11:00, lunch 12:50 to 2:15. Lab batches: A1 is roll numbers 01 to 29, A2 is 30 to 58.</p>`;
        } else {
            const f = ui.noteFilter;
            const notes = S.notes.filter(n => f === 'all' || n.subject === f);
            const opts = ['all'].concat(SUBJECTS.map(s => s.id), ['General']);
            body = `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div class="chips" style="margin:0">${opts.map(o => `<button class="chip ${f === o ? 'on' : ''}" data-act="note-filter" data-f="${o}">${o === 'all' ? 'All' : o}</button>`).join('')}</div></div>
                <div style="margin:12px 0"><button class="btn primary small" data-act="add-note">Add a note</button></div>
                ${notes.length ? `<div class="flat">${notes.map(n => `
                    <div class="note">
                        <div class="note-top"><span class="code-chip">${esc(n.subject)}</span><span class="date-sm">${esc(n.date)}</span></div>
                        <h3>${esc(n.title)}</h3>${n.desc ? `<p>${esc(n.desc)}</p>` : ''}
                        <div class="note-actions">${n.link ? `<a class="link-btn" href="${esc(n.link)}" target="_blank" rel="noopener noreferrer">Open link</a>` : ''}<button class="del" data-act="del-note" data-id="${n.id}">Delete</button></div>
                    </div>`).join('')}</div>`
                    : `<div class="sheet-paper empty"><b>No notes here yet</b>Save a Google Drive link to your notes, organised by subject.</div>`}`;
        }
        $('#page-study').innerHTML = `<h1 class="ptitle">Study</h1>
            <div class="seg" role="tablist">${tabs.map(([id, label]) => `<button role="tab" class="${ui.studyTab === id ? 'on' : ''}" data-act="study-tab" data-tab="${id}">${label}</button>`).join('')}</div>${body}`;
    };

    // ---------- PLAN ----------
    R.plan = function () {
        const total = S.tasks.length, done = S.tasks.filter(t => t.done).length;
        const pct = total ? Math.round(done / total * 100) : 0;
        let list = S.tasks.slice();
        if (ui.planFilter === 'todo') list = list.filter(t => !t.done);
        if (ui.planFilter === 'done') list = list.filter(t => t.done);
        list.sort((a, b) => (a.done - b.done) || ((a.date || '9999').localeCompare(b.date || '9999')));
        const rank = { High: 'high', Medium: '', Low: 'low' };
        $('#page-plan').innerHTML = `<h1 class="ptitle">Plan</h1>
            <div class="plan-head"><div class="donut" style="--p:${pct}"><span>${pct}%</span></div>
                <div><h2>${total ? `${done} of ${total} done` : 'A clear list'}</h2><p class="muted">${total ? (done === total ? 'Everything is ticked. Nice work.' : `${total - done} left to go.`) : 'Add your first task to get started.'}</p></div></div>
            <div class="chips">${[['all', 'All'], ['todo', 'To do'], ['done', 'Done']].map(([id, l]) => `<button class="chip ${ui.planFilter === id ? 'on' : ''}" data-act="plan-filter" data-f="${id}">${l}</button>`).join('')}</div>
            ${list.length ? `<ul class="tasks">${list.map(t => {
                const due = dueInfo(t.date);
                return `<li class="task ${t.done ? 'done' : ''}">
                    <button class="check" data-act="toggle" data-id="${t.id}" aria-label="${t.done ? 'Mark as not done' : 'Mark as done'}">✓</button>
                    <div class="task-body"><div class="task-title">${esc(t.title)}</div>
                        <div class="task-meta"><span class="pill">${esc(t.subject)}</span><span class="pill ${rank[t.priority] || ''}">${esc(t.priority)}</span>${due ? `<span class="${due.late && !t.done ? 'pill late' : ''}">${due.text}</span>` : ''}</div></div>
                    <button class="del" data-act="del-task" data-id="${t.id}" aria-label="Delete task">✕</button></li>`;
            }).join('')}</ul>`
                : `<div class="sheet-paper empty" style="margin-top:12px"><b>${total ? 'Nothing in this list' : 'No tasks yet'}</b>${total ? 'Try another filter.' : 'Tap Add task to plan your first assignment or revision.'}</div>`}
            <button class="fab" data-act="add-task"><svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add task</button>`;
    };

    // ---------- ME ----------
    R.me = function () {
        const p = S.profile, L = levelInfo(), d = today(), s = derived();
        $('#page-me').innerHTML = `
            <div class="me-head">
                <button class="avatar-ring" style="--p:${L.into}" data-act="avatar" aria-label="Change profile picture"><img src="${esc(p.avatar)}" alt="" /><span class="lvl">Lv ${L.lvl}</span></button>
                <div><div class="me-name">${esc(p.name)}</div>${p.usn ? `<span class="usn-pill">${esc(p.usn)}</span>` : `<button class="usn-pill" data-act="edit-profile">Add your USN</button>`}</div>
            </div>
            <p class="bio">${esc(p.bio)}</p>
            <div class="me-actions"><button class="btn ghost small" data-act="edit-profile">Edit profile</button><button class="btn ghost small" data-act="avatar">Change picture</button></div>

            <div class="stats4">
                <div><b>${Math.max(s.streak, 1)}</b><span>day streak</span></div>
                <div><b>${s.tasksDone}</b><span>tasks done</span></div>
                <div><b>${s.focusMinutes}</b><span>focus min</span></div>
                <div><b>${S.notes.length}</b><span>notes</span></div>
            </div>

            <div class="level-card">
                <div class="level-row"><b>Level ${L.lvl}: ${L.title}</b><span>${L.xp} XP</span></div>
                <div class="bar"><i style="width:${L.into}%"></i></div>
                <small>${100 - L.into} XP to level ${L.lvl + 1}. Finish tasks, focus sessions and notes to earn XP.</small>
            </div>

            <h2 class="sec-title">Today's challenges</h2>
            <div class="flat">${CHALLENGES.map(c => {
                const v = Math.min(c.val(d), c.goal), done = v >= c.goal;
                return `<div class="challenge ${done ? 'done' : ''}"><span class="em">${done ? '🎉' : c.icon}</span><div class="grow"><b>${c.text}</b><div class="bar"><i style="width:${v / c.goal * 100}%"></i></div></div><span class="xp">${done ? 'Done' : v + '/' + c.goal + ' · +' + c.xp + ' XP'}</span></div>`;
            }).join('')}</div>

            <h2 class="sec-title">Badges <span class="muted">${BADGES.filter(b => b.val(s) >= b.goal).length} of ${BADGES.length}</span></h2>
            <div class="badges">${BADGES.map(b => {
                const v = b.val(s), got = v >= b.goal;
                return `<button class="badge ${got ? '' : 'locked'}" data-act="badge" data-id="${b.id}"><span class="medal">${b.icon}</span><b>${b.name}</b><small>${got ? 'Earned' : (b.goal > 1 ? Math.min(v, b.goal) + '/' + b.goal : b.how)}</small></button>`;
            }).join('')}</div>

            <h2 class="sec-title">Settings</h2>
            <div class="flat">
                <button data-act="theme"><span class="em">🌙</span><span class="grow"><b>Dark mode</b><span>Easier on the eyes at night</span></span><span class="switch ${document.documentElement.dataset.theme === 'dark' ? 'on' : ''}"></span></button>
                <button data-act="feedback"><span class="em">💬</span><span class="grow"><b>Send feedback</b><span>Suggest a feature or report a bug</span></span><span class="go">›</span></button>
                <button data-act="pro"><span class="em">✨</span><span class="grow"><b>ElevenNotes Pro</b><span>Plan, revise, own your progress</span></span><span class="go">›</span></button>
                <button data-act="nav" data-to="about"><span class="em">👨‍💻</span><span class="grow"><b>About the developer</b><span>Meet Viresh</span></span><span class="go">›</span></button>
                <button data-act="reset"><span class="em">🗑️</span><span class="grow"><b class="danger-text">Reset my data</b><span>Clears everything saved in this browser</span></span></button>
            </div>`;
    };

    // ---------- FACULTY ----------
    function starsHtml(name) {
        const r = S.ratings[name] || 0;
        return `<span class="stars" data-for="${esc(name)}">${[1, 2, 3, 4, 5].map(v => `<button class="${v <= r ? 'on' : ''}" data-act="rate" data-name="${esc(name)}" data-v="${v}" aria-label="Rate ${v} of 5">★</button>`).join('')}</span>`;
    }
    R.faculty = function () {
        $('#page-faculty').innerHTML = `<div class="subhead"><button class="icon-btn" data-act="back" aria-label="Go back"><svg class="i" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg></button><h1>Faculty</h1></div>
            <p class="muted" style="margin:-6px 2px 12px">Your ratings stay private on this device.</p>
            <div class="flat">${FACULTY.map(f => `<div class="fac"><span class="em" style="font-size:30px">${f.emoji}</span><div class="grow"><b>${esc(f.name)}</b><span class="s">${esc(f.subject)} · ${esc(f.dept)}</span></div>${starsHtml(f.name)}</div>`).join('')}</div>`;
    };

    // ---------- EVENTS ----------
    R.events = function () {
        $('#page-events').innerHTML = `<div class="subhead"><button class="icon-btn" data-act="back" aria-label="Go back"><svg class="i" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg></button><h1>Events</h1></div>
            <div class="ev-intro"><h2>VIDHARA 2K26–27</h2><p>CSE department tech fest, 16 to 18 October.</p></div>
            ${EVENTS.map(g => `<div class="ev-group"><h3>${g.icon} ${esc(g.title)}<small>${esc(g.when)}</small></h3>
                <div class="flat" style="margin-top:0">${g.items.map(i => `<div class="ev-item"><span class="em">${i.icon}</span><div><b>${esc(i.name)}</b><span>${esc(i.desc)}</span></div></div>`).join('')}</div></div>`).join('')}`;
    };

    // ---------- COMMUNITY ----------
    R.community = function () {
        $('#page-community').innerHTML = `<div class="subhead"><button class="icon-btn" data-act="back" aria-label="Go back"><svg class="i" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg></button><h1>Community</h1></div>
            <div class="wa"><span class="badge-un">Unofficial</span><h2>RYMEC Student Community</h2>
                <p>A student-run WhatsApp group for discussions, opportunities, academics and hackathons.</p>
                <a href="https://chat.whatsapp.com/KBKiFgUl8qg9V8QRRrGOhE" target="_blank" rel="noopener noreferrer">Join on WhatsApp</a></div>
            <h2 class="sec-title">Study circles</h2>
            <div class="flat" style="margin-top:0">${STUDY_CIRCLES.map(c => `<div class="row"><span class="em">${c.emoji}</span><span class="grow"><b>${esc(c.name)}</b><span>${esc(c.topic)}</span></span>
                <button class="btn small ${S.circles[c.id] ? 'ghost' : 'primary'}" data-act="circle" data-id="${c.id}">${S.circles[c.id] ? 'Joined' : 'Join'}</button></div>`).join('')}</div>
            <p class="fine">Study circles are a personal checklist on this device. Use the WhatsApp community to meet other students.</p>`;
    };

    // ============================================================
    //  ROUTER
    // ============================================================
    const PAGES = ['home', 'study', 'plan', 'tools', 'me', 'faculty', 'events', 'community', 'about'];
    const NAV_OF = { faculty: 'home', events: 'home', community: 'home', about: 'me' };
    let current = 'home';

    let routedHash = null;
    function route() {
        routedHash = location.hash;
        let p = (location.hash || '#home').slice(1);
        if (!PAGES.includes(p)) p = 'home';
        current = p;
        closeSheet();
        $$('.page').forEach(el => el.classList.toggle('on', el.dataset.page === p));
        $$('.dock a').forEach(a => a.classList.toggle('on', a.dataset.nav === (NAV_OF[p] || p)));
        document.body.dataset.view = p;
        renderCurrent();
        window.scrollTo(0, 0);
    }
    function renderCurrent() { if (R[current]) R[current](); }
    function go(p) { location.hash = '#' + p; route(); }

    // ============================================================
    //  TOOLS
    // ============================================================
    function showTool(tab) {
        $$('#toolTabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
        $$('.tool').forEach(t => t.classList.toggle('on', t.id === 'tool-' + tab));
        if (tab === 'count') renderCountdown();
        if (tab === 'att') calcWhatIf(false);
        if (tab === 'sgpa') calcSgpa(false);
        if (tab === 'focus') timerUI();
    }

    // ----- SGPA -----
    function sgpaRows() {
        if (!S.sgpa) S.sgpa = SUBJECTS.map(s => ({ name: s.name, credits: s.credits, marks: '' }));
        return S.sgpa;
    }
    function renderSgpaRows() {
        $('#sgpaRows').innerHTML = sgpaRows().map((r, i) => `<div class="sgpa-row">
            <input data-f="name" data-i="${i}" value="${esc(r.name)}" aria-label="Subject name" placeholder="Subject" />
            <input data-f="credits" data-i="${i}" type="number" inputmode="decimal" min="0" max="10" value="${esc(r.credits)}" aria-label="Credits" />
            <input data-f="marks" data-i="${i}" type="number" inputmode="decimal" min="0" max="100" value="${esc(r.marks)}" placeholder="/100" aria-label="Marks out of 100" />
            <button class="rm" data-act="sgpa-rm" data-i="${i}" aria-label="Remove subject">✕</button></div>`).join('');
        calcSgpa(false);
    }
    function gradeOf(m) { return GRADES.find(g => m >= g.min); }
    function calcSgpa(userInput) {
        let cr = 0, pts = 0, n = 0;
        sgpaRows().forEach(r => {
            const m = parseFloat(r.marks), c = parseFloat(r.credits);
            if (isNaN(m) || isNaN(c) || c <= 0 || m < 0 || m > 100) return;
            cr += c; pts += c * gradeOf(m).p; n++;
        });
        $('#sgpaVal').textContent = n ? (pts / cr).toFixed(2) : '--';
        $('#sgpaNote').textContent = n ? `${cr} credits across ${n} subject${n > 1 ? 's' : ''}` : 'Add marks to see your SGPA';
        if (n && userInput && !S.stats.sgpaUsed) { S.stats.sgpaUsed = true; save('stats'); checkProgress(); }
    }

    // ----- attendance planner -----
    function calcWhatIf(userInput) {
        const v = id => parseFloat($('#' + id).value);
        const held = v('wiHeld'), att = v('wiAtt'), target = v('wiTarget'), future = v('wiFuture');
        const big = $('#wiVal'), note = $('#wiNote');
        if ([held, att, target, future].some(isNaN) || held < 0 || att < 0 || future < 0 || target <= 0 || target > 100) { big.textContent = '--'; note.textContent = 'Fill in all four boxes with valid numbers.'; return; }
        if (att > held) { big.textContent = '--'; note.textContent = 'Classes attended cannot be more than classes held.'; return; }
        const cur = held ? att / held * 100 : 0, total = held + future;
        const need = Math.max(0, Math.ceil(target / 100 * total - att - 1e-9));
        if (need > future) {
            big.textContent = '😬';
            note.textContent = `Even if you attend all ${future} remaining classes you will reach ${total ? ((att + future) / total * 100).toFixed(1) : 0}%, below your ${target}% target. You are at ${cur.toFixed(1)}% now.`;
        } else {
            const skip = future - need;
            big.textContent = skip;
            note.textContent = skip === future && future > 0 ? `You can miss all ${future} remaining classes and still stay at ${target}% or more. You are at ${cur.toFixed(1)}% now.`
                : skip === 0 ? `Attend every one of the next ${future} classes to reach ${target}%. You are at ${cur.toFixed(1)}% now.`
                : `You can miss up to ${skip} of the next ${future} classes and still finish at ${target}% or more. You are at ${cur.toFixed(1)}% now.`;
        }
        if (userInput && !S.stats.whatifUsed) { S.stats.whatifUsed = true; save('stats'); checkProgress(); }
    }

    // ----- countdown -----
    function renderCountdown() {
        const list = examList();
        if (!list.find(e => e.id === ui.exam)) ui.exam = list[0].id;
        $('#cdChips').innerHTML = list.map(e => `<button class="chip ${e.id === ui.exam ? 'on' : ''}" data-act="cd-pick" data-id="${esc(e.id)}">${esc(e.name)}${e.custom ? ` <span class="x" data-act="cd-rm" data-id="${esc(e.id)}" role="button" aria-label="Remove ${esc(e.name)}">✕</span>` : ''}</button>`).join('');
        tickCountdown();
    }
    function tickCountdown() {
        if (current !== 'tools') return;
        const e = examList().find(x => x.id === ui.exam);
        if (!e) return;
        $('#cdName').textContent = 'Countdown to ' + e.name;
        let diff = Math.max(new Date(e.date + 'T00:00:00') - Date.now(), 0);
        const d = Math.floor(diff / 864e5); diff -= d * 864e5;
        const h = Math.floor(diff / 36e5); diff -= h * 36e5;
        const m = Math.floor(diff / 6e4); diff -= m * 6e4;
        $('#cdD').textContent = pad(d); $('#cdH').textContent = pad(h); $('#cdM').textContent = pad(m); $('#cdS').textContent = pad(Math.floor(diff / 1000));
    }

    // ----- focus timer -----
    const C_RING = 552.92;
    const T = { mode: 'focus', running: false, endAt: 0, left: 0, total: 0, id: null };
    const modeSecs = m => m === 'focus' ? S.focusMin * 60 : m === 'short' ? 300 : 900;
    function timerReset(mode) {
        clearInterval(T.id); T.running = false;
        T.mode = mode || T.mode; T.total = T.left = modeSecs(T.mode);
        timerUI();
    }
    function timerUI() {
        const left = T.running ? Math.max(0, Math.round((T.endAt - Date.now()) / 1000)) : T.left;
        $('#tClock').textContent = `${pad(Math.floor(left / 60))}:${pad(left % 60)}`;
        $('#ringFg').style.strokeDashoffset = C_RING * (1 - (T.total ? left / T.total : 1));
        $('.ring').classList.toggle('brk', T.mode !== 'focus');
        $('#tLabel').textContent = T.running ? (T.mode === 'focus' ? 'Stay with it' : 'Take a breather') : (left < T.total ? 'Paused' : (T.mode === 'focus' ? 'Ready to focus' : 'Break time'));
        $('#tGo').textContent = T.running ? 'Pause' : (left < T.total ? 'Resume' : 'Start');
        $$('#modeTabs button').forEach(b => b.classList.toggle('on', b.dataset.mode === T.mode));
        $$('#lenChips .chip').forEach(b => b.classList.toggle('on', +b.dataset.min === S.focusMin));
        $('#lenChips').style.display = T.mode === 'focus' ? '' : 'none';
        $('#tToday').textContent = today().focusSessions;
        $('#tTotal').textContent = S.stats.focusMinutes;
    }
    function timerToggle() {
        if (T.running) { T.left = Math.max(0, Math.round((T.endAt - Date.now()) / 1000)); clearInterval(T.id); T.running = false; }
        else { T.running = true; T.endAt = Date.now() + T.left * 1000; T.id = setInterval(timerTick, 250); }
        timerUI();
    }
    function timerTick() {
        timerUI();
        if (Date.now() >= T.endAt) timerDone();
    }
    function beep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)(), o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; g.gain.value = 0.12; o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 350);
        } catch (e) { /* sound not available */ }
    }
    function timerDone() {
        const wasFocus = T.mode === 'focus';
        clearInterval(T.id); T.running = false;
        beep();
        S.sessions.unshift({ type: T.mode, min: Math.round(T.total / 60), at: Date.now() });
        S.sessions = S.sessions.slice(0, 30); save('sessions');
        if (wasFocus) { S.stats.focusSessions++; S.stats.focusMinutes += Math.round(T.total / 60); today().focusSessions++; save('stats'); save('daily'); }
        timerReset(wasFocus ? 'short' : 'focus');
        toast(wasFocus ? 'Focus session done. Take a short break.' : 'Break over. Ready for the next one?');
        if (wasFocus) checkProgress();
    }

    // ============================================================
    //  SHEETS (forms)
    // ============================================================
    const subjectOptions = sel => ['General'].concat(SUBJECTS.map(s => s.id)).map(id => `<option value="${id}" ${id === sel ? 'selected' : ''}>${id === 'General' ? 'General' : id + ' · ' + SUB[id].name}</option>`).join('');

    function taskSheet(subject) {
        openSheet('Add a task', `<form data-form="task">
            <label>What needs doing?<input name="title" maxlength="80" required placeholder="e.g. Submit Java assignment" /></label>
            <label>Subject<select name="subject">${subjectOptions(subject || 'General')}</select></label>
            <label>Priority</label>
            <div class="prio">${['High', 'Medium', 'Low'].map(p => `<label class="chip ${p === 'Medium' ? 'on' : ''}" style="margin:0"><input type="radio" name="priority" value="${p}" ${p === 'Medium' ? 'checked' : ''} style="display:none" />${p}</label>`).join('')}</div>
            <label>Due date <span class="opt">(optional)</span><input type="date" name="date" /></label>
            <button class="btn primary block" type="submit">Save task</button></form>`);
    }
    function noteSheet(subject) {
        openSheet('Add a note', `<form data-form="note">
            <label>Title<input name="title" maxlength="80" required placeholder="e.g. DSA unit 3 summary" /></label>
            <label>Subject<select name="subject">${subjectOptions(subject || 'General')}</select></label>
            <label>Link <span class="opt">(optional)</span><input type="url" name="link" placeholder="https://drive.google.com/..." /></label>
            <label>Short description <span class="opt">(optional)</span><textarea name="desc" rows="2" maxlength="140"></textarea></label>
            <button class="btn primary block" type="submit">Save note</button></form>`);
    }
    function profileSheet() {
        const p = S.profile;
        openSheet('Edit profile', `<form data-form="profile">
            <label>Name<input name="name" maxlength="40" required value="${esc(p.name === 'Student' ? '' : p.name)}" placeholder="Your name" /></label>
            <label>USN <span class="opt">(optional)</span><input name="usn" maxlength="20" value="${esc(p.usn)}" placeholder="e.g. 3VC25CS000" autocapitalize="characters" /></label>
            <label>Bio<textarea name="bio" rows="3" maxlength="120" placeholder="A line about you">${esc(p.bio)}</textarea></label>
            <button class="btn primary block" type="submit">Save profile</button></form>`);
    }
    function avatarSheet() {
        const list = ['boy-1', 'boy-2', 'boy-3', 'girl-1', 'girl-2', 'girl-3'].map(n => `images/avatar-${n}.jpeg`);
        openSheet('Choose a picture', `<div class="avatars">${list.map(src => `<button class="${S.profile.avatar === src ? 'on' : ''}" data-act="pick-avatar" data-src="${src}" aria-label="Choose this avatar"><img src="${src}" alt="" /></button>`).join('')}</div>`);
    }
    function proSheet() {
        openSheet('ElevenNotes Pro', `<p class="muted">Plan. Revise. Own it.</p>
            <div class="pro-list"><div><b>P</b><span><strong>Plan</strong><br>Organise your studies, tasks and goals.</span></div>
            <div><b>R</b><span><strong>Revise</strong><br>Review and track your progress.</span></div>
            <div><b>O</b><span><strong>Own it</strong><br>Take control of your student journey.</span></div></div>
            <p><strong>Pro is not a paid plan.</strong> It is free for every student.</p>
            <button class="btn primary block" data-act="close-sheet">Got it</button>`);
    }
    function feedbackSheet() {
        openSheet('Send feedback', `<p>Found a bug, or want a new feature? Tell us in a short form. It opens in a new tab.</p>
            <a class="btn primary block" href="https://forms.gle/qynARnBJsS2odeTd8" target="_blank" rel="noopener noreferrer">Open the feedback form</a>`);
    }
    function subjectSheet(id) {
        const s = SUB[id];
        const nNotes = S.notes.filter(n => n.subject === id).length, nTasks = S.tasks.filter(t => t.subject === id && !t.done).length;
        openSheet(s.id, `<p><b>${esc(s.name)}</b><br><span class="muted">${esc(s.code)}</span></p>
            <p class="muted" style="margin-bottom:4px">Taught by ${esc(s.faculty)}</p>${starsHtml(s.faculty)}
            <p class="muted" style="margin-top:12px">${nNotes} note${nNotes === 1 ? '' : 's'}, ${nTasks} open task${nTasks === 1 ? '' : 's'}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" data-act="note-for" data-id="${id}">Add a note</button><button class="btn ghost" data-act="task-for" data-id="${id}">Add a task</button></div>`);
    }
    function examSheet() {
        openSheet('Add your own date', `<form data-form="exam">
            <label>Name<input name="name" maxlength="30" required placeholder="e.g. Lab internal" /></label>
            <label>Date<input type="date" name="date" required /></label>
            <button class="btn primary block" type="submit">Save date</button></form>`);
    }

    const FORMS = {
        task(f) {
            const title = f.title.value.trim(); if (!title) return;
            S.tasks.unshift({ id: uid(), title, subject: f.subject.value, priority: f.priority.value, date: f.date.value || '', done: false, counted: false });
            save('tasks'); bump('tasksDone', 0, 'added');
            closeSheet(); renderCurrent(); toast('Task saved');
        },
        note(f) {
            const title = f.title.value.trim(), link = f.link.value.trim();
            if (!title) return;
            if (link && !/^https?:\/\//i.test(link)) { toast('Paste a full link that starts with https://'); return; }
            S.notes.unshift({ id: uid(), title, subject: f.subject.value, link, desc: f.desc.value.trim(), date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) });
            save('notes'); bump('notesAdded', 1, 'added');
            closeSheet(); renderCurrent(); toast('Note saved');
        },
        profile(f) {
            const name = f.name.value.trim(); if (!name) return;
            S.profile.name = name; S.profile.usn = f.usn.value.trim().toUpperCase(); S.profile.bio = f.bio.value.trim() || defaultProfile.bio;
            save('profile'); checkProgress();
            closeSheet(); renderCurrent(); toast('Profile updated');
        },
        exam(f) {
            const name = f.name.value.trim(); if (!name || !f.date.value) return;
            const id = 'c' + uid(); S.customExams.push({ id, name, date: f.date.value, custom: true });
            save('customExams'); ui.exam = id; closeSheet(); renderCountdown(); toast('Date added');
        }
    };

    // ============================================================
    //  ACTIONS
    // ============================================================
    const A = {
        theme() {
            const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = next; set('theme', next);
            if (next === 'dark' && !S.stats.darkTried) { S.stats.darkTried = true; save('stats'); checkProgress(); }
            if (current === 'me') renderCurrent();
        },
        pro: proSheet, feedback: feedbackSheet, avatar: avatarSheet, 'edit-profile': profileSheet,
        'close-sheet': closeSheet,
        back() { if (history.length > 1) history.back(); else go('home'); },
        nav(t) { go(t.dataset.to); },
        tool(t) {
            go('tools'); showTool(t.dataset.tab);
            if (t.dataset.exam) { ui.exam = t.dataset.exam; renderCountdown(); }
        },
        tooltab(t) { showTool(t.dataset.tab); },
        'study-tab'(t) { ui.studyTab = t.dataset.tab; if (current !== 'study') go('study'); else renderCurrent(); },
        day(t) { ui.day = +t.dataset.d; renderCurrent(); },
        subject(t) { subjectSheet(t.dataset.id); },
        'note-for'(t) { noteSheet(t.dataset.id); },
        'task-for'(t) { taskSheet(t.dataset.id); },
        'add-note'() { noteSheet(); },
        'add-task'() { taskSheet(); },
        'note-filter'(t) { ui.noteFilter = t.dataset.f; renderCurrent(); },
        'del-note'(t) { S.notes = S.notes.filter(n => n.id !== t.dataset.id); save('notes'); renderCurrent(); toast('Note deleted'); },
        'plan-filter'(t) { ui.planFilter = t.dataset.f; renderCurrent(); },
        toggle(t) {
            const task = S.tasks.find(x => x.id === t.dataset.id); if (!task) return;
            task.done = !task.done; save('tasks');
            if (task.done && !task.counted) { task.counted = true; save('tasks'); bump('tasksDone', 1, 'tasksDone'); toast('Task done. +10 XP'); }
            renderCurrent();
        },
        'del-task'(t) { S.tasks = S.tasks.filter(x => x.id !== t.dataset.id); save('tasks'); renderCurrent(); toast('Task deleted'); },
        'pick-avatar'(t) { S.profile.avatar = t.dataset.src; save('profile'); closeSheet(); renderCurrent(); toast('Picture updated'); },
        badge(t) {
            const b = BADGES.find(x => x.id === t.dataset.id), got = b.val(derived()) >= b.goal;
            toast(got ? `${b.icon} ${b.name}: earned` : `${b.icon} ${b.name}: ${b.how}`);
        },
        rate(t) {
            const name = t.dataset.name, v = +t.dataset.v;
            S.ratings[name] = S.ratings[name] === v ? 0 : v; save('ratings');
            $$(`.stars[data-for="${CSS.escape(name)}"] button`).forEach((b, i) => b.classList.toggle('on', i < S.ratings[name]));
            checkProgress();
        },
        circle(t) {
            const id = t.dataset.id; S.circles[id] = !S.circles[id]; save('circles'); checkProgress(); renderCurrent();
            toast(S.circles[id] ? 'Joined the study circle' : 'Left the study circle');
        },
        'sgpa-add'() { sgpaRows().push({ name: '', credits: 3, marks: '' }); save('sgpa'); renderSgpaRows(); },
        'sgpa-rm'(t) { sgpaRows().splice(+t.dataset.i, 1); save('sgpa'); renderSgpaRows(); },
        'cd-pick'(t) { ui.exam = t.dataset.id; renderCountdown(); },
        'cd-add': examSheet,
        'cd-rm'(t, e) {
            e.stopPropagation();
            S.customExams = S.customExams.filter(x => x.id !== t.dataset.id); save('customExams');
            if (ui.exam === t.dataset.id) ui.exam = EXAMS[0].id; renderCountdown();
        },
        mode(t) { if (T.running && !confirm('The timer is running. Switch and reset it?')) return; timerReset(t.dataset.mode); },
        len(t) { if (T.running && !confirm('The timer is running. Change length and reset it?')) return; S.focusMin = +t.dataset.min; set('focusMin', S.focusMin); timerReset('focus'); },
        't-toggle': timerToggle,
        't-reset'() { timerReset(); },
        't-skip'() { timerReset(T.mode === 'focus' ? 'short' : 'focus'); },
        music() {
            const a = $('#lofi'), b = $('#musicBtn');
            if (a.paused) { a.play().then(() => { b.classList.add('playing'); b.setAttribute('aria-pressed', 'true'); $('#musicState').textContent = 'Playing, tap to pause'; }).catch(() => toast('Could not play the music')); }
            else { a.pause(); b.classList.remove('playing'); b.setAttribute('aria-pressed', 'false'); $('#musicState').textContent = 'Tap to play'; }
        },
        reset() {
            if (!confirm('Reset everything saved in this browser? Your tasks, notes, ratings and progress will be removed.')) return;
            try { Object.keys(localStorage).filter(k => k.indexOf(KEY) === 0).forEach(k => localStorage.removeItem(k)); } catch (e) { /* ignore */ }
            location.hash = '#home'; location.reload();
        }
    };

    document.addEventListener('click', e => {
        const t = e.target.closest('[data-act]');
        if (!t) return;
        const fn = A[t.dataset.act];
        if (fn) { fn(t, e); }
    });
    document.addEventListener('submit', e => {
        const f = e.target.closest('form[data-form]');
        if (!f) return;
        e.preventDefault();
        FORMS[f.dataset.form](f);
    });
    document.addEventListener('change', e => {
        if (e.target.name === 'priority') $$('.prio .chip').forEach(c => c.classList.toggle('on', c.contains(e.target) && e.target.checked));
    });
    document.addEventListener('input', e => {
        const el = e.target;
        if (el.closest('#sgpaRows')) { sgpaRows()[+el.dataset.i][el.dataset.f] = el.value; save('sgpa'); calcSgpa(true); }
        if (el.closest('#tool-att')) calcWhatIf(true);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
    window.addEventListener('hashchange', () => { if (location.hash !== routedHash) route(); });

    // ============================================================
    //  START
    // ============================================================
    const todayKey = dkey();
    if (!S.stats.visits.includes(todayKey)) { S.stats.visits.push(todayKey); S.stats.visits = S.stats.visits.slice(-400); save('stats'); }
    today();
    timerReset('focus');
    renderSgpaRows();
    setInterval(tickCountdown, 1000);
    setInterval(() => { if (current === 'home') R.home(); }, 60000);
    route();
    checkProgress();
})();
