const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The original trial_timeline logic starts at "let trial_timeline = [" and ends before "let tutorial_procedure = {"
const startMarker = "let trial_timeline = [";
const endMarker = "let tutorial_procedure = {";

let startIndex = content.indexOf(startMarker);
let endIndex = content.indexOf(endMarker);

let preContent = content.substring(0, startIndex);
let postContent = content.substring(endIndex);

let newTrialTimeline = `
    let trial_timeline = [
        // Step 1: Choose option (Play or Escape)
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function() {
                let centerContent = \`<h2>Choose your option</h2>\`;
                return getGameBoardHTML(centerContent, jsPsych.timelineVariable('opponent').name, jsPsych.timelineVariable('is_pos_left'), false);
            },
            choices: ['e', 'p'],
            on_load: function() {
                // Setup touch listeners for mobile
                document.getElementById('btn-escape').onclick = function() {
                    jsPsych.pluginAPI.cancelAllKeyboardResponses();
                    jsPsych.finishTrial({response: 'e'});
                };
                document.getElementById('btn-play').onclick = function() {
                    jsPsych.pluginAPI.cancelAllKeyboardResponses();
                    jsPsych.finishTrial({response: 'p'});
                };
            },
            on_finish: function(data) {
                if (data.response === 'e') {
                    if (ring_uses < 10) {
                        ring_uses++;
                        window.escaped_this_trial = true;
                        data.escaped = true;
                        data.msg = "You escape the orc";
                    } else {
                        window.escaped_this_trial = false;
                        data.escaped = false;
                        data.msg = "You cannot use the ring anymore";
                    }
                } else {
                    window.escaped_this_trial = false;
                    data.escaped = false;
                    data.msg = null;
                }
            }
        },
        // Step 1.5: If tried to escape but no uses left
        {
            timeline: [{
                type: is_touch_device ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
                stimulus: function() {
                    let centerContent = \`<h2>You cannot use the ring anymore. You must play!</h2>\`;
                    if (!is_touch_device) centerContent += '<p>Press SPACE to continue.</p>';
                    return getGameBoardHTML(centerContent, jsPsych.timelineVariable('opponent').name, jsPsych.timelineVariable('is_pos_left'), true);
                },
                choices: is_touch_device ? ['Continue'] : [' ']
            }],
            conditional_function: function() {
                let last_data = jsPsych.data.get().last(1).values()[0];
                return last_data.response === 'e' && !last_data.escaped;
            }
        },
        // Step 2: Choose Punishment
        {
            timeline: [{
                type: jsPsychHtmlKeyboardResponse,
                stimulus: function() {
                    let centerContent = \`<h2>Choose how hard you hit</h2>\`;
                    if (is_touch_device) {
                        centerContent += \`<div class="punishment-grid">\`;
                        for(let i=1; i<=8; i++) {
                            centerContent += \`<button class="punishment-btn" data-val="\${i}">\${i}</button>\`;
                        }
                        centerContent += \`</div>\`;
                    } else {
                        centerContent += '<p>Press a number key between <strong>1</strong> and <strong>8</strong>.</p>';
                    }
                    return getGameBoardHTML(centerContent, jsPsych.timelineVariable('opponent').name, jsPsych.timelineVariable('is_pos_left'), true);
                },
                choices: is_touch_device ? "NO_KEYS" : ['1', '2', '3', '4', '5', '6', '7', '8'],
                on_load: function() {
                    if (is_touch_device) {
                        const btns = document.querySelectorAll('.punishment-btn');
                        btns.forEach(btn => {
                            btn.onclick = function() {
                                let val = this.getAttribute('data-val');
                                jsPsych.finishTrial({response: val});
                            };
                        });
                    }
                },
                on_finish: function(data) {
                    data.participant_punishment = parseInt(data.response);
                }
            }],
            conditional_function: function() {
                return !window.escaped_this_trial;
            }
        },
        // Brief display of chosen strength
        {
            timeline: [{
                type: jsPsychHtmlKeyboardResponse,
                stimulus: function() {
                    let last_data = jsPsych.data.get().last(1).values()[0];
                    let centerContent = \`<h2>You chose hitting strength: \${last_data.participant_punishment}</h2>\`;
                    return getGameBoardHTML(centerContent, jsPsych.timelineVariable('opponent').name, jsPsych.timelineVariable('is_pos_left'), true);
                },
                choices: "NO_KEYS",
                trial_duration: 1000
            }],
            conditional_function: function() {
                return !window.escaped_this_trial;
            }
        },
        // Delay before target
        {
            timeline: [{
                type: jsPsychHtmlKeyboardResponse,
                stimulus: function() {
                    return getGameBoardHTML("", jsPsych.timelineVariable('opponent').name, jsPsych.timelineVariable('is_pos_left'), true);
                },
                choices: "NO_KEYS",
                trial_duration: function() {
                    return jsPsych.randomization.sampleWithoutReplacement([500, 750, 1000, 1250, 1500], 1)[0];
                }
            }],
            conditional_function: function() {
                return !window.escaped_this_trial;
            }
        },
        // Step 3: Target (Reaction)
        {
            timeline: [{
                type: jsPsychHtmlKeyboardResponse,
                stimulus: function() {
                    let targetHTML = \`<div id="touch-target" style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer;">
                        <img src="images/football.jpeg" class="football-icon" style="width:150px; height:150px; margin-bottom: 20px;">
                        <p>\${action_instruction}</p>
                    </div>\`;
                    return getGameBoardHTML(targetHTML, jsPsych.timelineVariable('opponent').name, jsPsych.timelineVariable('is_pos_left'), true);
                },
                choices: [' '],
                trial_duration: 2000,
                on_load: function() {
                    const start_time = performance.now();
                    const target = document.getElementById('touch-target');
                    if (target) {
                        const handleTouch = function(e) {
                            e.preventDefault();
                            const rt = performance.now() - start_time;
                            jsPsych.pluginAPI.cancelAllKeyboardResponses();
                            jsPsych.finishTrial({rt: rt, response: 'touch'});
                        };
                        target.addEventListener('touchstart', handleTouch, {once: true});
                        target.addEventListener('mousedown', handleTouch, {once: true});
                    }
                },
                on_finish: function(data) {
                    let rt = data.rt;
                    let predefined_win = jsPsych.timelineVariable('predefined_win');
                    let opponent_punishment = jsPsych.timelineVariable('opponent_punishment');

                    let participant_won = false;
                    if (rt !== null && rt <= 500) {
                        participant_won = predefined_win;
                    }

                    if (!jsPsych.timelineVariable('is_tutorial')) {
                        if (participant_won) {
                            frodo_score++;
                        } else {
                            opponents_score++;
                        }
                    }

                    data.participant_won = participant_won;
                    data.opponent_punishment = opponent_punishment;
                }
            }],
            conditional_function: function() {
                return !window.escaped_this_trial;
            }
        },
        // Step 4: Result
        {
            timeline: [{
                type: is_touch_device ? jsPsychHtmlButtonResponse : jsPsychHtmlKeyboardResponse,
                stimulus: function() {
                    let last_task = jsPsych.data.get().filter({trial_type: 'html-keyboard-response'}).last(1).values()[0];
                    let won = last_task.participant_won;
                    let opp_pun = last_task.opponent_punishment;
                    let opp_name = jsPsych.timelineVariable('opponent').name;

                    let centerContent = '';
                    if (won) {
                        centerContent += \`<h2>You won! \${opp_name} chose punishment \${opp_pun}</h2>\`;
                    } else {
                        centerContent += \`<h2>You lost! You get hit with a strength of \${opp_pun}</h2>\`;
                        playScratch(opp_pun);
                    }
                    if (!is_touch_device) centerContent += '<p>Press SPACE to continue.</p>';
                    return getGameBoardHTML(centerContent, opp_name, jsPsych.timelineVariable('is_pos_left'), true);
                },
                choices: is_touch_device ? ['Continue'] : [' ']
            }],
            conditional_function: function() {
                return !window.escaped_this_trial;
            }
        }
    ];
`;

fs.writeFileSync('index.html', preContent + newTrialTimeline + postContent);
