const STORAGE_KEY = "dpboss_master_v3";
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || Array(15).fill().map(() => Array(6).fill("**"));
let base = null; 
let patternLine = []; 

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
    if (s === "**" || s === "") return null;
    for(let f in families) if(families[f].includes(s)) return f; 
    return s; 
}

// CSV Loader FIX: Isse ab CSV ka har row aur column load hoga
document.getElementById('csvFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const content = event.target.result;
        // Lines ko split karke data array mein convert karna
        const rows = content.split(/\r?\n/);
        data = rows.filter(row => row.trim() !== "").map(row => {
            return row.split(',').map(cell => cell.trim() || "**");
        });
        
        base = null; // Purana selection clear
        patternLine = [];
        render(); // Table ko naye data se refresh karna
        alert("CSV File Successfully Loaded!");
    };
    reader.readAsText(file);
});

function render() {
    const table = document.getElementById("mainChart");
    let html = `<tr><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th></tr>`;
    
    data.forEach((row, r) => {
        html += `<tr>`;
        row.forEach((val, c) => {
            let cellValue = val || "**";
            let cls = (cellValue === "**") ? "blank-cell" : "";
            
            // Highlight Logic
            if(base && base.r === r && base.c === c) cls += " base-jodi";
            let isMarked = patternLine.some(p => (base.r + p.dr === r) && (base.c + p.dc === c));
            if(isMarked) cls += " pattern-mark";
            
            html += `<td class="${cls}" 
                        onclick="handleClick(${r},${c},'${cellValue}')" 
                        contenteditable="true" 
                        oninput="updateValue(${r},${c},this.innerText)">${cellValue}</td>`;
        });
        html += `</tr>`;
    });
    table.innerHTML = html;
}

function handleClick(r, c, val) {
    // Agar blank par click kiya aur base set hai -> Search chalao
    if(val === "**" && base) {
        search(r, c);
        return;
    }
    
    // Agar Jodi par click kiya -> Selection logic
    if(val !== "**") {
        if(!base) {
            base = {r, c, val, fam: getFamily(val)};
            document.getElementById("status").innerText = "Base Fixed! Now select pattern (Blue Circles).";
        } else {
            // Check if already selected
            if(base.r === r && base.c === c) return;
            patternLine.push({dr: r - base.r, dc: c - base.c});
        }
        render();
    }
}

function search(tr, tc) {
    let results = [];
    let drB = tr - base.r;
    let dcB = tc - base.c;

    for(let i=0; i<data.length; i++) {
        for(let j=0; j<6; j++) {
            // Anchor matching
            if(getFamily(data[i][j]) === base.fam) {
                // Check if structural pattern exists there
                let ok = patternLine.every(p => {
                    let targetR = i + p.dr;
                    let targetC = j + p.dc;
                    return data[targetR] && data[targetR][targetC] !== "**";
                });
                
                if(ok) {
                    let resR = i + drB;
                    let resC = j + dcB;
                    if(data[resR] && data[resR][resC] !== "**") {
                        results.push({v: data[resR][resC], row: resR + 1});
                    }
                }
            }
        }
    }
    
    const output = document.getElementById("matchOutput");
    output.innerHTML = results.length ? 
        results.map(res => `<div>Row ${res.row} Result: <b>${res.v}</b></div>`).join('') : 
        "<div>No Logic Match found in this position.</div>";
}

function updateValue(r, c, v) { 
    data[r][c] = v.trim() || "**"; 
}

function addRow() { 
    data.push(Array(6).fill("**")); 
    render(); 
}

function saveData() { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); 
    alert("Record Saved!"); 
}

function resetEngine() { 
    base = null; 
    patternLine = []; 
    document.getElementById("status").innerText = "Select a Base Jodi (Red Box)";
    render(); 
}

render();
