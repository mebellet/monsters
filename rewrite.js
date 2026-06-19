const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const startMarker = "const timeline = [];";
const endMarker = "jsPsych.run(timeline);";

let startIndex = content.indexOf(startMarker);
let endIndex = content.indexOf(endMarker) + endMarker.length;

let preContent = content.substring(0, startIndex);
let timelineContent = content.substring(startIndex, endIndex);
let postContent = content.substring(endIndex);

let newLogic = `
    const possibleNames = ["Grommash", "Zul'jin", "Garrosh", "Gul'dan", "Thrall", "Malfurion", "Illidan", "Arthas"];
    let posImages = [];
    let negImages = [];

    async function discoverImages() {
        for (let i = 1; i <= 20; i++) {
            try {
                let resPos = await fetch('images/pos' + i + '.jpeg', { method: 'HEAD' });
                if (resPos.ok) posImages.push('images/pos' + i + '.jpeg');
            } catch(e) {}
            try {
                let resNeg = await fetch('images/neg' + i + '.jpeg', { method: 'HEAD' });
                if (resNeg.ok) negImages.push('images/neg' + i + '.jpeg');
            } catch(e) {}
        }
    }

    discoverImages().then(() => {
        if (posImages.length === 0) posImages.push('images/pos1.jpeg');
        if (negImages.length === 0) negImages.push('images/neg1.jpeg');
        let selectedPosImage = jsPsych.randomization.sampleWithoutReplacement(posImages, 1)[0];
        let selectedNegImage = jsPsych.randomization.sampleWithoutReplacement(negImages, 1)[0];

        let chosenNames = jsPsych.randomization.sampleWithoutReplacement(possibleNames, 2);

        window.non_provocative_opponent = {
            image: selectedPosImage,
            name: chosenNames[0],
            is_provocative: false
        };
        window.provocative_opponent = {
            image: selectedNegImage,
            name: chosenNames[1],
            is_provocative: true
        };

        // Initialize timeline inside async callback
        ${timelineContent}
    });
`;

let finalContent = preContent + newLogic + postContent;

// Replace old setup logic:
const setupStart = `let opponent_roles = jsPsych.randomization.shuffle(['👾', '👽']);
    let provocative_opponent = opponent_roles[0];
    let non_provocative_opponent = opponent_roles[1];`;

finalContent = finalContent.replace(setupStart, `
    let provocative_opponent = window.provocative_opponent;
    let non_provocative_opponent = window.non_provocative_opponent;
`);

// Manually replace the variable pushing:
finalContent = finalContent.replace(
    /tutorial_timeline_variables\.push\(\{\s*trial_num: i \+ 1,\s*opponent: opp,\s*predefined_win: p_win,\s*opponent_punishment: p_pun,\s*is_tutorial: true\s*\}\);/g,
    `tutorial_timeline_variables.push({
            trial_num: i + 1,
            opponent: opp,
            predefined_win: p_win,
            opponent_punishment: p_pun,
            is_tutorial: true,
            is_pos_left: jsPsych.randomization.sampleWithoutReplacement([true, false], 1)[0]
        });`
);

finalContent = finalContent.replace(
    /timeline_variables\.push\(\{\s*trial_num: i \+ 1,\s*opponent: opp,\s*predefined_win: p_win,\s*opponent_punishment: p_pun,\s*is_tutorial: false\s*\}\);/g,
    `timeline_variables.push({
            trial_num: i + 1,
            opponent: opp,
            predefined_win: p_win,
            opponent_punishment: p_pun,
            is_tutorial: false,
            is_pos_left: jsPsych.randomization.sampleWithoutReplacement([true, false], 1)[0]
        });`
);

fs.writeFileSync('index.html', finalContent);
