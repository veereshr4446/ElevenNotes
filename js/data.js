// ============================================================
//  DATA.JS — content for ElevenNotes.
//  Nothing here is fetched from, or sent to, any outside system.
//  Each class (branch + semester) has its own subjects, faculty,
//  timetable and dates in CLASS_DATA. Classes with no entry yet
//  show a friendly "not added yet" message. Always check your
//  official college timetable too.
// ============================================================

const BRANCHES = [
    { id: 'CSE-A', name: 'CSE – A',        long: 'Computer Science & Engineering, Section A', emoji: '💻' },
    { id: 'CSE-B', name: 'CSE – B',        long: 'Computer Science & Engineering, Section B', emoji: '💻' },
    { id: 'AIML',  name: 'CSE – AI & ML',  long: 'CSE (Artificial Intelligence & Machine Learning)', emoji: '🤖' },
    { id: 'DS',    name: 'CSE – Data Science', long: 'CSE (Data Science)', emoji: '📊' },
    { id: 'ISE',   name: 'ISE',            long: 'Information Science & Engineering', emoji: '🧩' },
    { id: 'ECE',   name: 'ECE',            long: 'Electronics & Communication Engineering', emoji: '📡' },
    { id: 'EEE',   name: 'EEE',            long: 'Electrical & Electronics Engineering', emoji: '⚡' },
    { id: 'ME',    name: 'Mechanical',     long: 'Mechanical Engineering', emoji: '⚙️' },
    { id: 'CIVIL', name: 'Civil',          long: 'Civil Engineering', emoji: '🏗️' }
];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const DEFAULT_CLASS = { branch: 'CSE-A', sem: 3 };

// A period is 55 minutes. t = start time in minutes from midnight, n = periods it spans.
// Keys of a timetable are day numbers (1 = Monday ... 6 = Saturday).
const PERIOD_MIN = 55;

const CLASS_DATA = {
    'CSE-A|3': {
        note: 'Odd semester, AY 2026-27. Break 10:50 to 11:00, lunch 12:50 to 2:15. Lab batches: A1 is roll numbers 01 to 29, A2 is 30 to 58.',
        subjects: [
            { id: 'DSP',  code: '1BMATCS301', name: 'Distributions and Statistics Probability', faculty: 'Prof. G. Gangamma',    kind: 'theory', credits: 3 },
            { id: 'JAVA', code: '1BCS302',    name: 'Object Oriented Programming with Java',    faculty: 'Dr. H. Girisha',       kind: 'theory', credits: 3 },
            { id: 'DDCO', code: '1BCS303',    name: 'Digital Design and Computer Organization', faculty: 'Prof. Radhika Y',      kind: 'theory', credits: 3 },
            { id: 'OS',   code: '1BCS304',    name: 'Operating Systems',                        faculty: 'Prof. Sharmila G K',   kind: 'theory', credits: 3 },
            { id: 'DSA',  code: '1BCS305',    name: 'Data Structures and Applications',         faculty: 'Prof. Rajeswari R.P',  kind: 'theory', credits: 3 },
            { id: 'DSL',  code: '1BCSL306',   name: 'Data Structures Laboratory',               faculty: 'Dr. Nagaveni Biradar / Amruth V', kind: 'lab', credits: 1 },
            { id: 'GIT',  code: '1BCSL307A',  name: 'Project Management (with Git)',            faculty: 'Prof. Prasanna Kumar', kind: 'lab',    credits: 1 },
            { id: 'CP',   code: '1BCP308',    name: 'Community Project / Societal Project',     faculty: 'Dr. H. Girisha',       kind: 'project', credits: 1 }
        ],
        faculty: [
            { name: 'Prof. G. Gangamma',    subject: 'Distributions and Statistics Probability', dept: 'Mathematics', emoji: '👩‍🏫' },
            { name: 'Dr. H. Girisha',       subject: 'Object Oriented Programming with Java',    dept: 'CSE',         emoji: '👨‍🏫' },
            { name: 'Prof. Radhika Y',      subject: 'Digital Design and Computer Organization', dept: 'CSE',         emoji: '👩‍🏫' },
            { name: 'Prof. Sharmila G K',   subject: 'Operating Systems',                        dept: 'CSE',         emoji: '👩‍🏫' },
            { name: 'Prof. Rajeswari R.P',  subject: 'Data Structures and Applications',         dept: 'CSE',         emoji: '👩‍🏫' },
            { name: 'Dr. Nagaveni Biradar', subject: 'Data Structures Laboratory',               dept: 'CSE',         emoji: '👩‍🏫' },
            { name: 'Amruth V',             subject: 'Data Structures Laboratory',               dept: 'CSE',         emoji: '👨‍🏫' },
            { name: 'Prof. Prasanna Kumar', subject: 'Project Management (with Git)',            dept: 'CSE',         emoji: '👨‍🏫' }
        ],
        timetable: {
            1: [
                { t: 540, n: 1, sub: 'DSA' }, { t: 595, n: 1, sub: 'DSA' }, { t: 660, n: 1, sub: 'DDCO' }, { t: 715, n: 1, sub: 'OS' },
                { t: 855, n: 3, title: 'Lab session', detail: 'Batch A1: Data Structures Lab. Batch A2: Project Management (Git)', kind: 'lab' }
            ],
            2: [
                { t: 540, n: 1, sub: 'DDCO' }, { t: 595, n: 1, sub: 'JAVA' }, { t: 660, n: 1, sub: 'DSA' }, { t: 715, n: 1, sub: 'DSP' },
                { t: 855, n: 3, title: 'Lab session', detail: 'Batch A2: Data Structures Lab. Batch A1: Project Management (Git)', kind: 'lab' }
            ],
            3: [
                { t: 540, n: 1, sub: 'OS' }, { t: 595, n: 1, sub: 'JAVA' }, { t: 660, n: 1, sub: 'DSA' }, { t: 715, n: 1, sub: 'DDCO' },
                { t: 855, n: 1, sub: 'DSP' }, { t: 910, n: 2, sub: 'CP' }
            ],
            4: [
                { t: 540, n: 2, title: 'OOPS Lab', detail: 'Java programming lab', kind: 'lab' },
                { t: 660, n: 1, sub: 'DSP' }, { t: 715, n: 1, sub: 'DDCO' },
                { t: 855, n: 1, sub: 'JAVA' }, { t: 910, n: 1, sub: 'OS' },
                { t: 965, n: 1, title: 'Yoga', detail: 'Wellness period', kind: 'free' }
            ],
            5: [
                { t: 540, n: 1, sub: 'DSP' }, { t: 595, n: 1, sub: 'JAVA' }, { t: 660, n: 1, sub: 'OS' }, { t: 715, n: 1, sub: 'DDCO' },
                { t: 855, n: 2, title: 'Library visit', detail: 'Read, borrow, revise', kind: 'free' }
            ],
            6: [
                { t: 540, n: 1, sub: 'OS' }, { t: 595, n: 1, sub: 'DSA' }, { t: 660, n: 1, sub: 'JAVA' }, { t: 715, n: 1, sub: 'DSP' }
            ]
        },
        exams: [
            { id: 'last',   name: 'Last working day', date: '2026-12-30' },
            { id: 'theory', name: 'VTU theory exams', date: '2027-01-04' },
            { id: 'prac',   name: 'Practical exams',  date: '2027-02-08' },
            { id: 'next',   name: 'Next semester',    date: '2027-02-22' }
        ]
    }
};

// Active class data. app.js fills these in from the class the student picked.
let SUBJECTS = [], FACULTY = [], TIMETABLE = {}, EXAMS = [];

// VTU grade scale (percentage of marks -> grade point)
const GRADES = [
    { min: 90, g: 'O',  p: 10 }, { min: 80, g: 'A+', p: 9 }, { min: 70, g: 'A', p: 8 },
    { min: 60, g: 'B+', p: 7 },  { min: 55, g: 'B',  p: 6 }, { min: 50, g: 'C', p: 5 },
    { min: 40, g: 'P',  p: 4 },  { min: 0,  g: 'F',  p: 0 }
];

// College fest, shown on the Events page
const EVENTS = [
    { icon: '💻', title: 'Technical events', when: '16 to 18 October', items: [
        { icon: '🌐', name: 'Web Development', desc: 'Build a web solution for a real-world problem using AI. Tools, models, databases and APIs are allowed.' },
        { icon: '🧠', name: 'Mind Hack', desc: 'Logic traps, pattern puzzles and misleading clues.' },
        { icon: '🐞', name: 'Coding and Debugging', desc: 'Debugging Duel: fix errors in a given program against the clock. Reverse Coding: write the program that gives the output.' },
        { icon: '🏆', name: 'Tech Quiz', desc: 'Programming, OS, DBMS, cybersecurity, gadgets and a rapid-fire round.' },
        { icon: '🔎', name: 'Web Search Hunt', desc: 'A multiplayer online hunt: solve riddles and puzzles using the web.' },
        { icon: '💡', name: 'Tech Pitch', desc: 'Pitch a technology idea to the judges: problem, innovation, solution and feasibility.' }
    ] },
    { icon: '🎮', title: 'Games', when: '16 to 18 October', items: [
        { icon: '🗺️', name: 'Treasure Hunt', desc: 'Find clues, solve challenges and race to the treasure.' },
        { icon: '🔥', name: 'Free Fire', desc: 'Competitive gaming, open to all branches.' },
        { icon: '🎯', name: 'BGMI', desc: 'Competitive multiplayer gaming, open to all branches.' }
    ] },
    { icon: '🎭', title: 'Group and fun activities', when: '17 October', items: [
        { icon: '💃', name: 'Flash Mob', desc: 'A dance performance with group and individual entries.' },
        { icon: '💪', name: 'Tug of War', desc: 'Team contest between departments. Department of DS and CY.' },
        { icon: '🏏', name: 'Mini Cricket', desc: 'Short-format cricket between teams. Department of DS and CY.' },
        { icon: '🏸', name: 'Badminton or Football', desc: 'Pick one and play with students from other branches.' }
    ] },
    { icon: '👗', title: 'Ethnic Day', when: '18 October', items: [
        { icon: '📸', name: 'Ethnic Day and Photo Booth', desc: 'Wear traditional outfits and capture the memories.' }
    ] }
];

const STUDY_CIRCLES = [
    { id: 'ai',     emoji: '🤖', name: 'AI Study Circle',     topic: 'Intro to AI' },
    { id: 'python', emoji: '🐍', name: 'Python Coders Club',  topic: 'Python programming' },
    { id: 'maths',  emoji: '📐', name: 'Maths Doubt Solvers', topic: 'Applied mathematics' },
    { id: 'chem',   emoji: '🧪', name: 'Chem Lab Prep Squad', topic: 'Applied chemistry' }
];

// Badges. `val` reads progress from the stats object, `goal` is the target.
const BADGES = [
    { id: 'hello',   icon: '👋', name: 'Hello!',          how: 'Open ElevenNotes',                 goal: 1,   val: s => 1 },
    { id: 'mine',    icon: '✏️', name: 'Made it mine',    how: 'Add your name and USN',            goal: 1,   val: s => s.profileDone ? 1 : 0 },
    { id: 'tick',    icon: '✅', name: 'First tick',      how: 'Finish 1 task',                    goal: 1,   val: s => s.tasksDone },
    { id: 'master',  icon: '🎯', name: 'Task master',     how: 'Finish 10 tasks',                  goal: 10,  val: s => s.tasksDone },
    { id: 'focus1',  icon: '🍅', name: 'First focus',     how: 'Complete 1 focus session',         goal: 1,   val: s => s.focusSessions },
    { id: 'deep',    icon: '🧠', name: 'Deep focus',      how: 'Focus for 120 minutes in total',   goal: 120, val: s => s.focusMinutes },
    { id: 'notes',   icon: '📝', name: 'Note keeper',     how: 'Save 3 notes',                     goal: 3,   val: s => s.notesAdded },
    { id: 'faculty', icon: '⭐', name: 'Faculty fan',     how: 'Rate 3 faculty',                   goal: 3,   val: s => s.rated },
    { id: 'calc',    icon: '🧮', name: 'Number cruncher', how: 'Use the SGPA and attendance tools', goal: 2,  val: s => (s.sgpaUsed ? 1 : 0) + (s.whatifUsed ? 1 : 0) },
    { id: 'owl',     icon: '🌙', name: 'Night owl',       how: 'Try dark mode',                    goal: 1,   val: s => s.darkTried ? 1 : 0 },
    { id: 'circle',  icon: '🤝', name: 'Joined in',       how: 'Join a study circle',              goal: 1,   val: s => s.circles },
    { id: 'roll',    icon: '🔥', name: 'On a roll',       how: 'Visit 3 days in a row',            goal: 3,   val: s => s.streak },
    { id: 'week',    icon: '🏆', name: 'Week warrior',    how: 'Visit 7 days in a row',            goal: 7,   val: s => s.streak }
];

const CHALLENGES = [
    { id: 'task',  icon: '✅', text: 'Finish 1 task',            goal: 1, xp: 20, val: d => d.tasksDone },
    { id: 'focus', icon: '🍅', text: 'Complete 2 focus sessions', goal: 2, xp: 30, val: d => d.focusSessions },
    { id: 'plan',  icon: '📝', text: 'Add a task or a note',      goal: 1, xp: 10, val: d => d.added }
];

const LEVELS = ['Fresher', 'Learner', 'Scholar', 'Achiever', 'Topper', 'Legend'];
