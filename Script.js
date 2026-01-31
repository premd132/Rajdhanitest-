let data = JSON.parse(localStorage.getItem("dp_data")) || Array(10).fill().map(() => Array(6).fill("**"));
let base = null; 
let patternLine = [];

const families = { "11":["11","16","61","66"], "22":["22","27","72","77"], "33":["33","38","83","88"], "44":["44","49","94","99"], "55":["00","05","50","55"], "12":["12","17","21","26","62","67","71","76"], "13":["13","18","31","36","63","68","81","86"], "14":["14","19","41","46","64","69","91","96"], "15":["01","06","10","15","51","56","60","65"], "23":["23","28","32","37","73","78","82","87"], "24":["24","29","42","47","74","79","92","97"], "25":["02","07","20","25","52","57","70","75"], "34":["34","39","43","48","84","89","93","98"], "35":["03","08","30","35","53","58","80","85"], "45":["04","09","40","45","54","59","90","95"] };

function getFamily(v) { 
    let s = String(v).trim();
    for(let f in families) if(families[f].includes(s)) return f; 
    return s; 
}

// 1. Upload logic
document.getElementById('csvFileInput').addEventListener('change', (e) => {
    let reader = new FileReader();
    reader.onload = (ev) => processData(ev.target.result);
    reader.readAsText(e.target.files[0]);
});

// 2. Paste logic
function togglePasteBox() {
    let b = document.getElementById('pasteBox');
    b.style.display = b.style.display === 'none' ? 'block' : 'none';
}

function loadFromText() {
    processData(document.getElementById('csvTextArea').value);
    togglePasteBox();
}

function processData(raw) {
    data = raw.split(/\r?\n/).filter(l => l.trim()).map(l => {
        let c = l.split(',');
        while(c.length < 6) c.push("**");
        return c.slice(0,6).map(x => x.trim() || "**");
    });
    render();
    alert("Data Loaded!");
}

function render() {
    let html = `<tr><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th></tr>`;
    data.forEach((row, r) => {
        html += `<tr>`;
        row.forEach((val, c) => {
            let cls = val === "**" ? "blank-cell" : "";
            if(base && base.r === r && base.c === c) cls += " base-jodi";
            if(patternLine.some(p => base.r+p.dr===r && base.c+p.dc===c)) cls += " pattern-mark";
            html += `<td class="${cls}" onclick="handleClick(${r},${c},'${val}')" contenteditable="true" onblur="update(${r},${c},this.innerText)">${val}</td>`;
        });
        html += `</tr>`;
    });
    document.getElementById("mainChart").innerHTML = html;
}

function handleClick(r, c, val) {
    if(val === "**" && base) { search(r, c); return; }
    if(val !== "**") {
        if(!base) base = {r, c, val, fam: getFamily(val)};
        else patternLine.push({dr: r-base.r, dc: c-base.c});
        render();
    }
}

function search(tr, tc) {
    let res = [];
    let drB = tr-base.r, dcB = tc-base.c;
    data.forEach((row, i) => {
        row.forEach((val, j) => {
            if(getFamily(val) === base.fam) {
                if(patternLine.every(p => data[i+p.dr] && data[i+p.dr][j+p.dc] !== "**")) {
                    if(data[i+drB] && data[i+drB][j+dcB] !== "**") 
                        res.push({v: data[i+drB][j+dcB], row: i+drB+1});
                }
            }
        });
    });
    document.getElementById("matchOutput").innerHTML = res.map(m => `<div>Found: ${m.v} (Row ${m.row})</div>`).join('') || "No Match";
}

function update(r,c,v) { data[r][c] = v.trim(); }
function addRow() { data.push(Array(6).fill("**")); render(); }
function saveData() { localStorage.setItem("dp_data", JSON.stringify(data)); alert("Saved!"); }
function resetEngine() { base = null; patternLine = []; render(); }
render();
