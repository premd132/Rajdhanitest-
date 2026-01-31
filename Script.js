const STORAGE_KEY = "dpboss_master_final_v1";
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

// STRONGER CSV LOADER
document.getElementById('csvFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) {
        alert("No file selected!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const content = event.target.result;
            // Rows split (handle different OS line breaks)
            const lines = content.split(/\r\n|\n/);
            
            const newData = lines
                .map(line => line.trim())
                .filter(line => line.length > 0) // Skip empty lines
                .map(line => {
                    let cols = line.split(',');
                    // Ensure each row has 6 columns
                    while(cols.length < 6) cols.push("**");
                    return cols.slice(0, 6).map(c => c.trim() || "**");
                });

            if(newData.length > 0) {
                data = newData;
                base = null;
                patternLine = [];
                render();
                alert("Success: " + data.length + " rows loaded!");
            } else {
                alert("CSV file seems empty or corrupted.");
            }
        } catch (err) {
            alert("Error reading CSV: " + err.message);
        }
    };
    
    reader.onerror = function() {
        alert("Could not read file!");
    };
    
    reader.readAsText(file);
});

function render() {
    const table = document.getElementById("mainChart");
    let html = `<tr><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th></tr>`;
    
    data.forEach((row, r) => {
        html += `<tr>`;
        row.forEach((val, c) => {
            let v = val || "**";
            let cls = (v === "**") ? "blank-cell" : "";
            if(base && base.r === r && base.c === c) cls += " base-jodi";
            let isMarked = patternLine.some(p => (base.r + p.dr === r) && (base.c + p.dc === c));
            if(isMarked) cls += " pattern-mark";
            
            html += `<td class="${cls}" 
                        onclick="handleClick(${r},${c},'${v}')" 
                        contenteditable="true" 
                        oninput="updateValue(${r},${c},this.innerText)">${v}</td>`;
        });
        html += `</tr>`;
    });
    table.innerHTML = html;
}

function handleClick(r, c, val) {
    if(val === "**" && base) {
        search(r, c);
        return;
    }
    if(val !== "**") {
        if(!base) {
            base = {r, c, val, fam: getFamily(val)};
            document.getElementById("status").innerText = "Base: " + val + " (Set). Select patterns.";
        } else {
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
            if(getFamily(data[i][j]) === base.fam) {
                let ok = patternLine.every(p => {
                    let rP = i + p.dr;
                    let cP = j + p.dc;
                    return data[rP] && data[rP][cP] !== "**";
                });
                if(ok) {
                    let rR = i + drB, rC = j + dcB;
                    if(data[rR] && data[rR][rC] !== "**") {
                        results.push({v: data[rR][rC], row: rR + 1});
                    }
                }
            }
        }
    }
    const output = document.getElementById("matchOutput");
    output.innerHTML = results.length ? 
        results.map(res => `<div>Matched: <b>${res.v}</b> (Row ${res.row})</div>`).join('') : 
        "<div>No Pattern Found.</div>";
}

function updateValue(r, c, v) { data[r][c] = v.trim() || "**"; }
function addRow() { data.push(Array(6).fill("**")); render(); }
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); alert("Data Saved Locally!"); }
function resetEngine() { base = null; patternLine = []; render(); }

render();
