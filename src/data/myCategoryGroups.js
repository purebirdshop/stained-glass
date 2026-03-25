// P (1 digit) → collision resolver (starts at 1, increments if needed)
// LL (2 digits) → word length
// SSS (3 digits) → A1Z26 sum
    // adults               → 106077
    // kids                 → 104043
    // junior-high          → 110119
    // high-school          → 110104
    // high-cards           → 109077
    // unique-dna           → 109106
    // assigned-volunteers  → 118229

const categoryGroups = {
    "adults":{
        id: 106077,
        ccb: [],
        metrics: [302229]
    },
    "kids":{        
        id: 104043,
        ccb: [],
        metrics: [302227,306757,302225]
    },
    "junior-high":{
        id: 110119,
        ccb: [],
        metrics: [304721,304720]
    },
    "high-school":{
        id: 110104,
        ccb: [],
        metrics: [652218,648461]
    },
    "high-cards":{  
        id: 109077,
        ccb: [],
        metrics: [391753,644934]
    },
    "unique-dna":{
        id: 109106,
        ccb: [],
        metrics: [633276,302233]
    },
    "assigned-volunteers":{
        id: 118229,
        ccb: [],
        metrics: [679252]
    }
}

// auditorium
// kidz
// jrHighAwakenYouth
// jrHighAwakenYouth
// highSchoolTeenagers
// highCards
// dNAAttendees
// dNAAttendees
// assignedVolunteers
