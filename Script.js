const STORAGE_KEY = "dpboss_pro_data_v2";
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
    for(let f in families) if(families[f].includes(s)) return f; 
    return s; 
}

// CSV Upload Logic
document.getElementById('csvFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = text.split('\n');
        data = rows.filter(r => r.trim() !== "").map(row => {
            let cols = row.split(',');
            return cols.map(c => c.trim() || "**");
        });
        render();
        alert("CSV Data Loaded Successfully!");
    };
    reader.readAsText(file);
});

function render() {
    const table = document.getElementById("mainChart");
    let html = `<tr><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th></tr>`;
    data.forEach((row, r) => {
        html += `<tr>`;
        row.forEach((val, c) => {
            let cls = (val === "**" || val === "") ? "blank-cell" : "";
            if(base && base.r === r && base.c === c) cls += " base-jodi";
            let isMarked = patternLine.some(p => (base.r + p.dr === r) && (base.c + p.dc === c));
            if(isMarked) cls += " pattern-mark";
            
            // contenteditable="true" allows direct editing
            html += `<td class="${cls}" 
                        onclick="handleLogic(${r},${c},'${val}')" 
                        contenteditable="true" 
                        oninput="updateValue(${r},${c},this.innerText)">${val}</td>`;
        });
        html += `</tr>`;
    });
    table.innerHTML = html;
}

function handleLogic(r, c, val) {
    // If clicking on a blank cell to find pattern
    if((val === "**" || val === "") && base) {
        search(r, c);
        return;
    }
    
    // Logic for setting Base or Pattern Marks
    if(val !== "**" && val !== "") {
        if(!base) {
            base = {r, c, val, fam: getFamily(val)};
            document.getElementById("status").innerText = `Base Set: ${val}. Now select pattern members.`;
        } else {
            let dr = r - base.r, dc = c - base.c;
            if(dr === 0 && dc === 0) return;
            patternLine.push({dr, dc});
        }
        render();
    }
}

function search(tr, tc) {
    let results = [];
    let drB = tr - base.r, dcB = tc - base.c;

    for(let i=0; i<data.length; i++) {
        for(let j=0; j<6; j++) {
            // Anchor matching by family
            if(getFamily(data[i][j]) === base.fam) {
                let ok = patternLine.every(p => {
                    return data[i+p.dr] && data[i+p.dr][j+p.dc] !== "**" && data[i+p.dr][j+p.dc] !== "";
                });
                
                if(ok && data[i+drB] && data[i+drB][j+dcB] !== "**") {
                    results.push({val: data[i+drB][j+dcB], row: i + drB + 1});
                }
            }
        }
    }
    
    const output = document.getElementById("matchOutput");
    if(results.length > 0) {
        output.innerHTML = results.map(res => `<div>Row ${res.row} Match: <b>${res.val}</b></div>`).join('');
    } else {
        output.innerHTML = "<div>No Logic Matches Found in History.</div>";
    }
}

function updateValue(r, c, v) { 
    data[r][c] = v.trim(); 
}

function addRow() { 
    data.push(Array(6).fill("**")); 
    render(); 
}

function saveData() { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); 
    alert("Record Saved Successfully!"); 
}

function resetEngine() { 
    base = null; 
    patternLine = []; 
    document.getElementById("status").innerText = "Select a Base Jodi (Red Box)";
    document.getElementById("matchOutput").innerText = "No pattern selected.";
    render(); 
}

render();
