const STORAGE_KEY = "DP_KING_PRO_V100";
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || Array(12).fill().map(() => Array(6).fill("**"));
let base = null; 
let patternLine = []; 

// 100% Correct Family Logic
const families = { 
    "11":["11","16","61","66"], "22":["22","27","72","77"], "33":["33","38","83","88"], 
    "44":["44","49","94","99"], "55":["00","05","50","55"], "12":["12","17","21","26","62","67","71","76"],
    "13":["13","18","31","36","63","68","81","86"], "14":["14","19","41","46","64","69","91","96"],
    "15":["01","06","10","15","51","56","60","65"], "23":["23","28","32","37","73","78","82","87"],
    "24":["24","29","42","47","74","79","92","97"], "25":["02","07","20","25","52","57","70","75"],
    "34":["34","39","43","48","84","89","93","98"], "35":["03","08","30","35","53","58","80","85"],
    "45":["04","09","40","45","54","59","90","95"]
};

function getFamily(v) {
    let s = String(v).trim();
    if(!s || s === "**") return null;
    for(let f in families) if(families[f].includes(s)) return f;
    return s;
}

// --- High Precision CSV Reader ---
document.getElementById('csvFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        const text = ev.target.result;
        // Detects any line break and splits accurately
        const rows = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        data = rows.map(line => {
            // Split by comma, semicolon or tab (Excel standard)
            let cols = line.split(/[,\t;]/);
            while(cols.length < 6) cols.push("**");
            return cols.slice(0, 6).map(c => c.trim() || "**");
        });
        
        base = null; patternLine = [];
        render();
        alert("Success: " + data.length + " rows loaded into system!");
    };
    reader.readAsText(file);
});

// --- UI Engine ---
function render() {
    const table = document.getElementById("mainChart");
    let html = `<tr><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th></tr>`;
    data.forEach((row, r) => {
        html += `<tr>`;
        row.forEach((val, c) => {
            let v = val || "**";
            let cls = (v === "**") ? "blank-cell" : "";
            if(base && base.r === r && base.c === c) cls += " base-jodi";
            if(patternLine.some(p => (base.r + p.dr === r) && (base.c + p.dc === c))) cls += " pattern-mark";
            
            html += `<td class="${cls}" 
                        onclick="handleClick(${r},${c},'${v}')" 
                        contenteditable="true" 
                        onblur="updateValue(${r},${c},this.innerText)">${v}</td>`;
        });
        html += `</tr>`;
    });
    table.innerHTML = html;
}

function handleClick(r, c, val) {
    // If clicking on empty cell to predict
    if((val === "**" || val === "") && base) {
        executeSearch(r, c);
        return;
    }
    // If selecting Jodi to build pattern
    if(val !== "**" && val !== "") {
        if(!base) {
            base = {r, c, val, fam: getFamily(val)};
            document.getElementById("status").innerText = "Status: Base Fixed ("+val+"). Select Blue Pattern Points.";
        } else {
            if(base.r === r && base.c === c) return;
            patternLine.push({dr: r - base.r, dc: c - base.c});
        }
        render();
    }
}

// --- Dpboss Search Logic ---
function executeSearch(tr, tc) {
    let matches = [];
    let drB = tr - base.r, dcB = tc - base.c;

    data.forEach((row, i) => {
        row.forEach((val, j) => {
            // Match Anchor by Family
            if(getFamily(val) === base.fam) {
                // Verify structural pattern integrity
                let structuralMatch = patternLine.every(p => {
                    let checkR = i + p.dr, checkC = j + p.dc;
                    return data[checkR] && data[checkR][checkC] !== "**";
                });
                
                if(structuralMatch) {
                    let targetR = i + drB, targetC = j + dcB;
                    if(data[targetR] && data[targetR][targetC] !== "**") {
                        matches.push({v: data[targetR][targetC], r: targetR + 1});
                    }
                }
            }
        });
    });
    
    const out = document.getElementById("matchOutput");
    out.innerHTML = matches.length ? 
        matches.map(m => `<div class="match-item">Pattern Found: <b>${m.v}</b> (Old Row: ${m.r})</div>`).join('') : 
        `<div class="match-item">No Logic Found in History.</div>`;
}

function updateValue(r, c, v) { data[r][c] = v.trim() || "**"; }
function addRow() { data.push(Array(6).fill("**")); render(); }
function saveData() { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); 
    alert("Record Saved in Browser Storage!"); 
}
function resetEngine() { 
    base = null; patternLine = []; render(); 
    document.getElementById("status").innerText = "Status: Engine Reset. Select Base.";
}

render();
