// --- FUNKCIJE ---
function ocistiRacun(racunStr) {
    const samoCifre = String(racunStr).replace(/\D/g, '');
    
    if (samoCifre.length > 5 && samoCifre.length < 18) {
        const kodBanke = samoCifre.slice(0, 3);
        const kontrolniBroj = samoCifre.slice(-2);
        const partijaRacuna = samoCifre.slice(3, -2);
        
        const partijaSaNulam = partijaRacuna.padStart(13, '0');
        
        return `${kodBanke}${partijaSaNulam}${kontrolniBroj}`;
    }
    
    return samoCifre.padStart(18, '0');
}

function formatirajZaPrikaz(racun18Cifara) {
    if (racun18Cifara.length === 18) {
        return `${racun18Cifara.slice(0, 3)}-${racun18Cifara.slice(3, -2)}-${racun18Cifara.slice(-2)}`;
    }
    return racun18Cifara;
}

function formatirajBrojSaTackom(broj) {
    return Math.round(broj).toLocaleString('de-DE');
}

function ukloniKvacice(str) {
    return String(str)
        .replace(/č/g, 'c').replace(/Č/g, 'C')
        .replace(/ć/g, 'c').replace(/Ć/g, 'C')
        .replace(/š/g, 's').replace(/Š/g, 'S')
        .replace(/đ/g, 'dj').replace(/Đ/g, 'Dj')
        .replace(/ž/g, 'z').replace(/Ž/g, 'Z');
}

// --- STANJE APLIKACIJE ---
let stanje = {
    userName: "",
    userBank: "",
    vRacun: 0,
    vDostava: 0,
    metoda: "Ravnopravno",
    brojLjudi: 2,
    clanoviUcesnici: [],
    rucniIznosi: {}
};

// --- DOM ELEMENTI ---
const inputUserName = document.getElementById("userName");
const inputUserBank = document.getElementById("userBank");
const validAccountBanner = document.getElementById("validAccountBanner");
const validAccountDisplay = document.getElementById("validAccountDisplay");

const inputVRacun = document.getElementById("vRacun");
const inputVDostava = document.getElementById("vDostava");
const btnNoviIznos = document.getElementById("btnNoviIznos");
const sumaUkupnoDisplay = document.getElementById("sumaUkupnoDisplay");

const pillBtns = document.querySelectorAll(".pill-btn");
const panelRavnopravno = document.getElementById("panelRavnopravno");
const panelRucni = document.getElementById("panelRucni");

const brojLjudiInput = document.getElementById("brojLjudi");
const infoRavnopravno = document.getElementById("infoRavnopravno");
const poOsobiDisplay = document.getElementById("poOsobiDisplay");

const novoImeInput = document.getElementById("novoImeInput");
const dostavaInfoBox = document.getElementById("dostavaInfoBox");
const dostavaPoOsobiDisplay = document.getElementById("dostavaPoOsobiDisplay");
const listaUcesnikaContainer = document.getElementById("listaUcesnikaContainer");
const statusRazlikeContainer = document.getElementById("statusRazlikeContainer");
const btnObrisiListu = document.getElementById("btnObrisiListu");

const btnGenerisiQR = document.getElementById("btnGenerisiQR");
const qrRezultatiContainer = document.getElementById("qrRezultatiContainer");

// --- EVENT LISTENERS ---
inputUserName.addEventListener("input", (e) => {
    stanje.userName = e.target.value;
    proveriGlavniQRUslov();
});

inputUserBank.addEventListener("input", (e) => {
    stanje.userBank = e.target.value;
    azurirajValidacijuRacuna();
    proveriGlavniQRUslov();
});

inputVRacun.addEventListener("input", (e) => {
    stanje.vRacun = parseFloat(e.target.value) || 0;
    osveziProracune();
});

inputVDostava.addEventListener("input", (e) => {
    stanje.vDostava = parseFloat(e.target.value) || 0;
    osveziProracune();
});

btnNoviIznos.addEventListener("click", () => {
    stanje.vRacun = 0;
    stanje.vDostava = 0;
    stanje.brojLjudi = 2;
    stanje.clanoviUcesnici = [];
    stanje.rucniIznosi = {};
    
    inputVRacun.value = "";
    inputVDostava.value = "";
    brojLjudiInput.value = 2;
    novoImeInput.value = "";
    qrRezultatiContainer.innerHTML = "";
    
    osveziProracune();
});

pillBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        pillBtns.forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        stanje.metoda = e.target.getAttribute("data-method");
        
        if (stanje.metoda === "Ravnopravno") {
            panelRavnopravno.style.display = "block";
            panelRucni.style.display = "none";
        } else {
            panelRavnopravno.style.display = "none";
            panelRucni.style.display = "block";
        }
        osveziProracune();
    });
});

brojLjudiInput.addEventListener("input", (e) => {
    stanje.brojLjudi = parseInt(e.target.value) || 1;
    osveziProracune();
});

novoImeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const ime = novoImeInput.value.trim();
        if (ime && !stanje.clanoviUcesnici.includes(ime)) {
            stanje.clanoviUcesnici.push(ime);
            stanje.rucniIznosi[ime] = 0;
            novoImeInput.value = "";
            renderujRucneUcesnike();
            osveziProracune();
        }
    }
});

btnObrisiListu.addEventListener("click", () => {
    stanje.clanoviUcesnici = [];
    stanje.rucniIznosi = {};
    renderujRucneUcesnike();
    osveziProracune();
});

btnGenerisiQR.addEventListener("click", () => {
    generisiQRKodove();
});

// --- LOGIKA I PRIKAZ ---
function azurirajValidacijuRacuna() {
    const raw = stanje.userBank.trim();
    if (!raw) {
        validAccountBanner.style.display = "none";
        return;
    }
    const samoCifre = raw.replace(/\D/g, '');
    const cRacun = ocistiRacun(samoCifre);
    const prikaz = formatirajZaPrikaz(cRacun);
    
    validAccountDisplay.textContent = prikaz;
    validAccountBanner.style.display = "block";
}

function osveziProracune() {
    const sumaUkupno = stanje.vRacun + stanje.vDostava;
    sumaUkupnoDisplay.textContent = formatirajBrojSaTackom(sumaUkupno) + " RSD";
    
    let validnaPodelaFlag = false;
    
    if (stanje.metoda === "Ravnopravno") {
        if (stanje.brojLjudi > 1 && sumaUkupno > 0) {
            const poOsobi = sumaUkupno / stanje.brojLjudi;
            const poOsobiZaokruzeno = Math.round(poOsobi);
            poOsobiDisplay.textContent = formatirajBrojSaTackom(poOsobiZaokruzeno) + " RSD";
            infoRavnopravno.style.display = "block";
            validnaPodelaFlag = true;
        } else {
            infoRavnopravno.style.display = "none";
            validnaPodelaFlag = false;
        }
    } else {
        if (stanje.clanoviUcesnici.length > 0) {
            const brUcesnika = stanje.clanoviUcesnici.length;
            const fiksnaDostava = stanje.vDostava / brUcesnika;
            dostavaPoOsobiDisplay.textContent = formatirajBrojSaTackom(Math.round(fiksnaDostava)) + " RSD";
            dostavaInfoBox.style.display = "block";
            btnObrisiListu.style.display = "block";
            
            let trenutnaSuma = 0;
            stanje.clanoviUcesnici.forEach(o => {
                trenutnaSuma += (stanje.rucniIznosi[o] || 0);
            });
            
            const ostatak = sumaUkupno - trenutnaSuma;
            if (Math.abs(ostatak) < 0.01 && sumaUkupno > 0) {
                statusRazlikeContainer.innerHTML = `<div class="info-box">Izbori su potpuno izbalansirani!</div>`;
                validnaPodelaFlag = true;
            } else if (ostatak > 0) {
                statusRazlikeContainer.innerHTML = `<div class="warning-box">Preostalo: <strong>${formatirajBrojSaTackom(ostatak)} RSD</strong></div>`;
                validnaPodelaFlag = false;
            } else {
                statusRazlikeContainer.innerHTML = `<div class="error-box">Višak: <strong>${formatirajBrojSaTackom(Math.abs(ostatak))} RSD</strong></div>`;
                validnaPodelaFlag = false;
            }
        } else {
            dostavaInfoBox.style.display = "none";
            btnObrisiListu.style.display = "none";
            statusRazlikeContainer.innerHTML = "";
            validnaPodelaFlag = false;
        }
    }
    
    if (validnaPodelaFlag && sumaUkupno > 0 && stanje.userName.trim() && stanje.userBank.trim()) {
        btnGenerisiQR.style.display = "block";
    } else {
        btnGenerisiQR.style.display = "none";
        qrRezultatiContainer.innerHTML = "";
    }
}

function renderujRucneUcesnike() {
    listaUcesnikaContainer.innerHTML = "";
    stanje.clanoviUcesnici.forEach(o => {
        const row = document.createElement("div");
        row.className = "participant-row";
        
        const nameDiv = document.createElement("div");
        nameDiv.className = "participant-name";
        nameDiv.textContent = o + ":";
        
        const inputNum = document.createElement("input");
        inputNum.type = "number";
        inputNum.className = "participant-input";
        inputNum.min = "0";
        inputNum.placeholder = "0";
        inputNum.step = "1";
        inputNum.value = stanje.rucniIznosi[o] || "";
        inputNum.addEventListener("input", (e) => {
            stanje.rucniIznosi[o] = parseFloat(e.target.value) || 0;
            osveziProracune();
        });
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "participant-delete";
        deleteBtn.textContent = "❌";
        deleteBtn.title = "Ukloni " + o;
        deleteBtn.addEventListener("click", () => {
            stanje.clanoviUcesnici = stanje.clanoviUcesnici.filter(item => item !== o);
            delete stanje.rucniIznosi[o];
            renderujRucneUcesnike();
            osveziProracune();
        });
        
        row.appendChild(nameDiv);
        row.appendChild(inputNum);
        row.appendChild(deleteBtn);
        listaUcesnikaContainer.appendChild(row);
    });
}

function proveriGlavniQRUslov() {
    osveziProracune();
}

function generisiQRKodove() {
    qrRezultatiContainer.innerHTML = "";

    const sumaUkupno = stanje.vRacun + stanje.vDostava;
    const cRacun = ocistiRacun(stanje.userBank);
    const imePrimaoca = ukloniKvacice(stanje.userName.trim());
    
    if (!imePrimaoca || !cRacun) {
        alert("⚠️ Popuni podatke o primaocu na vrhu strane!");
        return;
    }
    
    if (stanje.metoda === "Ravnopravno") {
        const poOsobi = Math.round(sumaUkupno / stanje.brojLjudi);
        const izFmt = (poOsobi).toFixed(2).replace('.', ',');
        const ipsData = `K:PR|V:01|C:1|R:${cRacun}|N:${imePrimaoca}|I:RSD${izFmt}|SF:289|S:Podela racuna`;
        
        const card = document.createElement("div");
        card.className = "qr-card";
        
        const h4 = document.createElement("h4");
        h4.textContent = `Iznos: ${formatirajBrojSaTackom(poOsobi)} RSD`;
        card.appendChild(h4);
        
        const qrWrapper = document.createElement("div");
        qrWrapper.className = "qr-image-wrapper";
        const qrBox = document.createElement("div");
        qrBox.className = "qr-image-box";
        
        const img = document.createElement("img");
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ipsData)}`;
        img.alt = "IPS QR Kod";
        
        qrBox.appendChild(img);
        qrWrapper.appendChild(qrBox);
        card.appendChild(qrWrapper);
        qrRezultatiContainer.appendChild(card);
        
    } else {
        for (const [ime, dug] of Object.entries(stanje.rucniIznosi)) {
            if (dug > 0) {
                const izFmt = (dug).toFixed(2).replace('.', ',');
                const cistIme = ukloniKvacice(ime);
                const ipsData = `K:PR|V:01|C:1|R:${cRacun}|N:${imePrimaoca}|I:RSD${izFmt}|SF:289|S:Rucak-${cistIme}`;
                
                const card = document.createElement("div");
                card.className = "qr-card";
                
                const h4 = document.createElement("h4");
                h4.textContent = `${ime} - ${formatirajBrojSaTackom(dug)} RSD`;
                card.appendChild(h4);
                
                const qrWrapper = document.createElement("div");
                qrWrapper.className = "qr-image-wrapper";
                const qrBox = document.createElement("div");
                qrBox.className = "qr-image-box";
                
                const img = document.createElement("img");
                img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ipsData)}`;
                img.alt = "IPS QR Kod";
                
                qrBox.appendChild(img);
                qrWrapper.appendChild(qrBox);
                card.appendChild(qrWrapper);
                qrRezultatiContainer.appendChild(card);
            }
        }
    }
}
