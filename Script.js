// Storage and State
let data = JSON.parse(localStorage.getItem("dp_data_v4")) || Array(12).fill().map(() => Array(6).fill("**"));
let base = null; 
let patternLine = [];

// Full Family Logic
const families = { "11":["11","16","61","66"], "22":["22","27","72","77"], "33":["33","38","83","88"], "44":["44","49","94","99"], "55":["00","05","50","55"], "12":["12","17","21","26","62","67","71","76"], "13":["13","18","31","36","63","68","81","86"], "14":["14","19","41","46","64","69","91","96"], "15":["01","06","10","15","51","56","60","65"], "23":["23","28","32","37","73","78","82","87"], "24":["24","29","42","47","74","79","92","97"], "25":["02","07","20","25","52","57","70","75"], "34":["34","39","43","48","84","89","93","98"], "35":["03","08","30","35","53","58","80","85"], "45":["04","09","40","45","54","59","90","95"] };

function getFamily(v) { 
    let s = String(v).trim();
    if(s === "**" || s === "") return null;
    for(let f in families) if(families[f].includes(s)) return f; 
    return s; 
}

// --- DATA LOADING LOGIC ---

// 1. File Upload Handler
document.getElementById('csvFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        console.log("File read success");
        processRawText(ev.target.result);
    };
    reader.onerror = () => alert("Error reading file!");
    reader.readAsText(file);
});

// 2. Manual Paste Toggle
function togglePasteBox() {
    let b = document.getElementById('pasteBox');
    b.style.display = (b.style.display === 'none') ? 'block' : 'none';
}

function loadFromText() {
    const text = document.getElementById('csvTextArea').value;
    if(!text.trim()) { alert("Please paste some data!"); return; }
    processRawText(text);
    togglePasteBox();
}

// 3. Central Processor (Works for both Upload and Paste)
function processRawText(raw) {
    try {
        // Split by lines and then by commas or tabs (Excel support)
        let rows = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
        data = rows.map(line => {
            let cols = line.split(/[,\t]/); // Support comma or tab
            while(cols.length < 6) cols.push("**");
            return cols.slice(0, 6).map(c => c.trim() || "**");
        });
        
        base = null;
        patternLine = [];
        render();
        alert("Data Loaded Successfully: " + data.length + " rows.");
    } catch (err) {
        alert("Error processing data: " + err.message);
    }
}

// --- CORE ENGINE ---

function render() {
    let html = `<tr><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th></tr>`;
    data.forEach((row, r) => {
        html += `<tr>`;
        row.forEach((val, c) => {
            let v = val || "**";
            let cls = v === "**" ? "blank-cell" : "";
            if(base && base.r === r && base.c === c) cls += " base-jodi";
            if(patternLine.some(p => base.r+p.dr===r && base.c+p.dc===c)) cls += " pattern-mark";
            
            html += `<td class="${cls}" onclick="handleClick(${r},${c},'${v}')" contenteditable="true" onblur="update(${r},${c},this.innerText)">${v}</td>`;
        });
        html += `</tr>`;
    });
    document.getElementById("mainChart").innerHTML = html;
}

function handleClick(r, c, val) {
    if(val === "**" && base) { search(r, c); return; }
    if(val !== "**") {
        if(!base) {
            base = {r, c, val, fam: getFamily(val)};
            document.getElementById("status").innerText = "Base: " + val + " (Fixed). Now select pattern points.";
        } else {
            if(base.r === r && base.c === c) return;
            patternLine.push({dr: r - base.r, dc: c - base.c});
        }
        render();
    }
}

function search(tr, tc) {
    let res = [];
    let drB = tr - base.r, dcB = tc - base.c;
    
    data.forEach((row, i) => {
        row.forEach((val, j) => {
            if(getFamily(val) === base.fam) {
                let ok = patternLine.every(p => data[i+p.dr] && data[i+p.dr][j+p.dc] !== "**");
                if(ok) {
                    let rR = i + drB, rC = j + dcB;
                    if(data[rR] && data[rR][rC] !== "**") 
                        res.push({v: data[rR][rC], row: rR + 1});
                }
            }
        });
    });
    
    document.getElementById("matchOutput").innerHTML = res.length ? 
        res.map(m => `<div>Match Found: <b style="font-size:20px;">${m.v}</b> (Row ${m.row})</div>`).join('') : 
        "<div>No Historical Pattern Found.</div>";
}

function update(r,c,v) { data[r][c] = v.trim() || "**"; }
function addRow() { data.push(Array(6).fill("**")); render(); }
function saveData() { localStorage.setItem("dp_data_v4", JSON.stringify(data)); alert("Saved to Browser!"); }
function resetEngine() { base = null; patternLine = []; render(); document.getElementById("status").innerText = "Ready: Select Base Jodi"; }

render();
