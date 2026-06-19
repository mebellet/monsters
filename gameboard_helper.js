const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

let helperCode = `
    // Game Board Layout Helper
    function getGameBoardHTML(centerHTML, activeOpponentName, isPosLeft, hideActions = false) {
        let leftOpponent = isPosLeft ? window.non_provocative_opponent : window.provocative_opponent;
        let rightOpponent = isPosLeft ? window.provocative_opponent : window.non_provocative_opponent;

        let leftClass = (leftOpponent.name === activeOpponentName) ? '' : 'inactive-opponent';
        let rightClass = (rightOpponent.name === activeOpponentName) ? '' : 'inactive-opponent';

        let actionOptionsHTML = hideActions ? '' : \`
            <div class="action-options">
                <div class="action-btn" id="btn-escape">
                    <div class="action-icon">🚪</div>
                    <div class="action-label">Escape (E)</div>
                </div>
                <div class="action-btn" id="btn-play">
                    <img src="images/football.jpeg" class="football-icon">
                    <div class="action-label">Play (P)</div>
                </div>
            </div>
        \`;

        return \`
            <div id="game-board">
                <div class="board-top">
                    <div class="opponent-container \${leftClass}">
                        <img src="\${leftOpponent.image}" class="opponent-image">
                        <div class="opponent-name">\${leftOpponent.name}</div>
                    </div>
                    <div class="opponent-container \${rightClass}">
                        <img src="\${rightOpponent.image}" class="opponent-image">
                        <div class="opponent-name">\${rightOpponent.name}</div>
                    </div>
                </div>
                <div class="board-center">
                    \${centerHTML}
                </div>
                <div class="board-bottom">
                    \${actionOptionsHTML}
                    <div class="player-container">
                        <div class="player-avatar">👤</div>
                        <div class="player-name">Player</div>
                    </div>
                </div>
            </div>
        \`;
    }
`;

// Insert it right after device detection
let target = `    const is_touch_device = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);`;

content = content.replace(target, target + '\n' + helperCode);
fs.writeFileSync('index.html', content);
