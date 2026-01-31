const STORAGE_KEY = "dpboss_pro_data";
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || Array(12).fill().map(() => Array(6).fill("**"));
let base = null; 
let patternLine = []; 

const families = { 
    "11":["11","16","61","66"], "22":["22","27","72","77"], "33":["33","38","83","88"], 
    "44":["44","49","94","99"], "55":["00","05","50","55"], "12":["12","17","21","26","62","67","71","76"] 
    /* Baki families bhi isi tarah add hoti hain */
};

function getFamily(v) { for(let f in families) if(families[f].includes(v)) return f; return v; }

function render() {
    const table = document.getElementById("mainChart");
    let html = `<tr><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th></tr>`;
    data.forEach((row, r) => {
        html += `<tr>`;
        row.forEach((val, c) => {
            let cls = val === "**" ? "blank-cell" : "";
            if(base && base.r === r && base.c === c) cls += " base-jodi";
            let isMarked = patternLine.some(p => (base.r + p.dr === r) && (base.c + p.dc === c));
            if(isMarked) cls += " pattern-mark";
            
            html += `<td class="${cls}" onclick="handleLogic(${r},${c},'${val}')" contenteditable="true" onblur="update(${r},${c},this.innerText)">${val}</td>`;
        });
        html += `</tr>`;
    });
    table.innerHTML = html;
}

function handleLogic(r, c, val) {
    if(val !== "**") {
        if(!base) {
            base = {r, c, val, fam: getFamily(val)};
            document.getElementById("status").innerText = "Base Set! Now click pattern members (Blue Circles).";
        } else {
            let dr = r - base.r, dc = c - base.c;
            if(dr === 0 && dc === 0) return;
            patternLine.push({dr, dc});
        }
        render();
    } else if(base) {
        search(r, c);
    }
}

function search(tr, tc) {
    let results = [];
    let drB = tr - base.r, dcB = tc - base.c;

    for(let i=0; i<data.length; i++) {
        for(let j=0; j<6; j++) {
            if(getFamily(data[i][j]) === base.fam) {
                let ok = patternLine.every(p => data[i+p.dr] && data[i+p.dr][j+p.dc] !== "**");
                if(ok && data[i+drB] && data[i+drB][j+dcB] !== "**") {
                    results.push(data[i+drB][j+dcB]);
                }
            }
        }
    }
    document.getElementById("matchOutput").innerHTML = results.length ? 
        results.map(r => `<div>Logic Match Found: <b>${r}</b></div>`).join('') : "No Match.";
}

function update(r,c,v) { data[r][c] = v; }
function addRow() { data.push(Array(6).fill("**")); render(); }
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); alert("Saved!"); }
function resetSystem() { base = null; patternLine = []; render(); }

render();
