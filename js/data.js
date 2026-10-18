// ============================================================
//  DATA.JS — Sample data only.
//  Nothing here is fetched from or sent to any real system.
// ============================================================

const subjectsData = [
    { code: '1BMATCS301', name: 'Distributions and Statistics Probability', faculty: 'Prof. G. Gangamma' },
    { code: '1BCS302', name: 'Object Oriented Programming with Java', faculty: 'Dr. H. Girisha' },
    { code: '1BCS303', name: 'Digital Design and Computer Organization', faculty: 'Prof. Radhika Y' },
    { code: '1BCS304', name: 'Operating Systems', faculty: 'Prof. Sharmila G K' },
    { code: '1BCS305', name: 'Data Structures and Applications', faculty: 'Prof. Rajeswari R.P' },
    { code: '1BCSL306', name: 'Data Structures Laboratory', faculty: 'Dr. Nagaveni Biradar' },
    { code: '1BCSL307A', name: 'Project Management (with Git)', faculty: 'Prof. Prasanna Kumar' },
    { code: '1BCP308', name: 'Community Project / Societal Project', faculty: 'Dr. H. Girisha' }
];

// Faculty — Semester 3, Section A
// Phone numbers are deliberately left out: a student app should not
// publish teachers' personal numbers.
const facultyData = [
    { name: 'Prof. G. Gangamma', subject: 'Distributions and Statistics Probability', dept: 'Mathematics', photo: '👩‍🏫' },
    { name: 'Dr. H. Girisha', subject: 'Object Oriented Programming with Java', dept: 'CSE', photo: '👨‍🏫' },
    { name: 'Prof. Radhika Y', subject: 'Digital Design and Computer Organization', dept: 'CSE', photo: '👩‍🏫' },
    { name: 'Prof. Sharmila G K', subject: 'Operating Systems', dept: 'CSE', photo: '👩‍🏫' },
    { name: 'Prof. Rajeswari R.P', subject: 'Data Structures and Applications', dept: 'CSE', photo: '👩‍🏫' },
    { name: 'Dr. Nagaveni Biradar', subject: 'Data Structures Laboratory', dept: 'CSE', photo: '👩‍🏫' },
    { name: 'Prof. Prasanna Kumar', subject: 'Project Management (with Git)', dept: 'CSE', photo: '👨‍🏫' }
];

// Semester dates used by the Exam Countdown tool
const examDates = [
    { name: 'Last Working Day of Semester', date: '2026-12-30' },
    { name: 'VTU Theory Exams Begin', date: '2027-01-04' },
    { name: 'Practical Examinations Begin', date: '2027-02-08' },
    { name: 'Next Semester Commences', date: '2027-02-22' }
];

window.subjectsData = subjectsData;
window.facultyData = facultyData;
window.examDates = examDates;

console.log('📘 data.js loaded.');
