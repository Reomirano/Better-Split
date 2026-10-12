function ocistiRacun(r) {
    let cifre = r.replace(/\D/g, "");
    if (cifre.length > 5 && cifre.length < 18) {
        let kod = cifre.slice(0, 3);
        let kontrolni = cifre.slice(-2);
        let partija = cifre.slice(3, -2).padStart(13, "0");
        return kod + partija + kontrolni;
    }
    return cifre.padStart(18, "0");
}

function formatirajRacun(r) {
    return r.length === 18 ? `${r.slice(0,3)}-${r.slice(3,-2)}-${r.slice(-2)}` : r;
}

function updateRacun() {
    let r = document.getElementById("racun").value;
    let c = ocistiRacun(r);
    document.getElementById("validanRacun").innerHTML =
        `Validan račun: <b>${formatirajRacun(c)}</b>`;
}

document.getElementById("racun").addEventListener("input", updateRacun);

let mode = "equal";
let clanovi = [];

function setMode(m) {
    mode = m;
    let box = document.getElementById("modeBox");

    if (m === "equal") {
        box.innerHTML = `
            <label>Broj osoba:</label>
            <input id="brOsoba" type="number" min="1" value="2">
        `;
    } else {
        box.innerHTML = `
            <label>Dodaj učesnika:</label>
            <input id="noviClan" type="text" placeholder="Ime" onkeydown="if(event.key==='Enter') addClan()">
            <div id="clanoviBox"></div>
        `;
        renderClanovi();
    }
}

function addClan() {
    let ime = document.getElementById("noviClan").value.trim();
    if (ime && !clanovi.includes(ime)) clanovi.push(ime);
    document.getElementById("noviClan").value = "";
    renderClanovi();
}

function renderClanovi() {
    let box = document.getElementById("clanoviBox");
    box.innerHTML = "";

    clanovi.forEach(ime => {
        box.innerHTML += `
            <div style="margin-bottom:10px;">
                <b>${ime}</b>
                <input id="dug_${ime}" type="number" min="0" value="0">
                <button onclick="removeClan('${ime}')">❌</button>
            </div>
        `;
    });
}

function removeClan(ime) {
    clanovi = clanovi.filter(c => c !== ime);
    renderClanovi();
}

function generateQR() {
    let ime = document.getElementById("ime").value.trim();
    let racun = ocistiRacun(document.getElementById("racun").value);
    let iznos = Number(document.getElementById("iznos").value);
    let dostava = Number(document.getElementById("dostava").value);

    if (!ime || racun.length !== 18) {
        alert("Popuni ime i validan račun!");
        return;
    }

    let ukupno = iznos + dostava;
    document.getElementById("ukupno").innerHTML = `Ukupno: ${ukupno} RSD`;

    let out = document.getElementById("qrOutput");
    out.innerHTML = "";

    if (mode === "equal") {
        let br = Number(document.getElementById("brOsoba").value);
        let poOsobi = Math.round(ukupno / br);

        let ips = `K:PR|V:01|C:1|R:${racun}|N:${ime}|I:RSD${poOsobi.toFixed(2).replace('.', ',')}|SF:289|S:Podela`;

        out.innerHTML += `<h3>Zajednički: ${poOsobi} RSD</h3>`;
        let div = document.createElement("div");
        out.appendChild(div);
        new QRCode(div, ips);

    } else {
        clanovi.forEach(ime => {
            let dug = Number(document.getElementById(`dug_${ime}`).value);
            if (dug > 0) {
                let ips = `K:PR|V:01|C:1|R:${racun}|N:${document.getElementById("ime").value}|I:RSD${dug.toFixed(2).replace('.', ',')}|SF:289|S:Rucak-${ime}`;

                out.innerHTML += `<h3>${ime}: ${dug} RSD</h3>`;
                let div = document.createElement("div");
                out.appendChild(div);
                new QRCode(div, ips);
            }
        });
    }
}
