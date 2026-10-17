// RECUPERER LES ELEMENTS DE LA PAGE
const nomInput = document.getElementById('nom');
const prenomInput = document.getElementById('prénom');
const emailInput = document.getElementById('mail');
const classeSelect = document.getElementById('classe');
const noteInput = document.getElementById('notesur');
const boutonAjouter = document.querySelector('.labelle button');
const message = document.getElementById('formMsg');
const totalEl = document.getElementById('total');
const admisEl = document.getElementById('etudiants admis');
const echecEl = document.getElementById('etudiant echecs');
const pourcentageEchecEl = document.getElementById('echec');
const reussiteEl = document.getElementById('reussite');
const moyenneEl = document.getElementById('moyenne');
const meilleureEl = document.getElementById('note meilleur');
const basseEl = document.getElementById('basse note');
const affiche = document.querySelector('.affiché');
const filtreResultat = document.getElementById('resultat');
const filtreClasse = document.getElementById('touteslesclasses');
const rechercheInput = document.getElementById('rechercheetudia');
const repertoire = document.getElementById('repertoire');
const boutonReset = document.getElementById('renitialisation');
const boutonSombre = document.getElementById('themesombre');

// Mode sombre
boutonSombre.addEventListener('click', function () {
    document.body.classList.toggle('sombre');
    boutonSombre.textContent = document.body.classList.contains('sombre') ? '☀️ Mode clair' : '🌙 Mode sombre';
});

// Export Excel
exportexcel.addEventListener('click', function () {

    const entetes = ["Nom", "Prénom", "Email", "Classe", "Note"];

    const lignes = etudiants.map(e => [
        e.nom,
        e.prenom,
        e.email,
        e.classe,
        e.note
    ]);

    const excelContent = "data:text/excel;charset=utf-8,\uFEFF" +
        [entetes, ...lignes]
            .map(ligne => ligne.join(";"))
            .join("\r\n");

    const encodedUri = encodeURI(excelContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'etudiants.excel');
    link.click();
});

// On garde le message répertoire vide de côté pour le remettre quand il faut
const etatVide = repertoire.innerHTML;

//  LES DONNÉES
// On récupère les étudiants sauvegardés (ou un tableau vide si rien n'est sauvegardé)
let etudiants = JSON.parse(localStorage.getItem('etudiants')) || [];

// Quand on clique sur "Modifier", on garde ici l'id de l'étudiant concerné
let idEnModification = null;

function sauvegarder() {
    localStorage.setItem('etudiants', JSON.stringify(etudiants));
}

function afficherMessage(texte, type) {
    message.textContent = texte;
    message.className = 'form-msg ' + type;
}


//  AJOUTER OU MODIFIER UN ETUDIANT
boutonAjouter.addEventListener('click', function (event) {
    event.preventDefault();

    // On lit ce que l'utilisateur a tapé
    const nom = nomInput.value.trim();
    const prenom = prenomInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const classe = classeSelect.value;
    const noteTexte = noteInput.value.trim().replace(',', '.');

    // tous les champs sont remplis ?
    if (nom === '' || prenom === '' || email === '' || noteTexte === '' || classeSelect.selectedIndex === 0) {
        afficherMessage('❌ Veuillez remplir tous les champs.', 'error');
        return;
    }

    // l'email a un format valide ?
    if (!email.includes('@') || !email.includes('.')) {
        afficherMessage('❌ Adresse email invalide.', 'error');
        return;
    }

    // la note est entre 0 et 20 ?
    const note = Number(noteTexte);
    if (isNaN(note) || note < 0 || note > 20) {
        afficherMessage('❌ La note doit être comprise entre 0 et 20.', 'error');
        return;
    }

    // l'email est-il déjà utilisé par UN AUTRE étudiant ?
    // (en mode ajout idEnModification vaut null, donc tous les étudiants sont comparés)
    const dejaUtilise = etudiants.some(function (e) {
        return e.email.trim().toLowerCase() === email
            && e.id !== idEnModification;
    });

    if (dejaUtilise) {
        afficherMessage('❌ Adresse email déjà utilisée.', 'error');
        return;
    }

    if (idEnModification === null) {
        // Mode AJOUT
        const nouvelEtudiant = {
            id: Date.now(),
            nom: nom,
            prenom: prenom,
            email: email,
            classe: classe,
            note: note
        };

        etudiants.push(nouvelEtudiant);
        afficherMessage('✅ Étudiant ajouté avec succès.', 'success');

    } else {
        // Mode MODIFICATION
        const etudiant = etudiants.find(function (e) {
            return e.id === idEnModification;
        });

        etudiant.nom = nom;
        etudiant.prenom = prenom;
        etudiant.email = email;
        etudiant.classe = classe;
        etudiant.note = note;

        // On repasse en mode ajout
        idEnModification = null;
        boutonAjouter.textContent = "Ajouter l'étudiant";
        afficherMessage('✅ Étudiant modifié avec succès.', 'success');
    }

    sauvegarder();

    // On vide le formulaire
    nomInput.value = '';
    prenomInput.value = '';
    emailInput.value = '';
    noteInput.value = '';
    classeSelect.selectedIndex = 0;

    afficherEtudiants();
});

//  MODIFIER : remplir le formulaire avec les infos de l'étudiant
function modifierEtudiant(id) {
    const etudiant = etudiants.find(function (e) {
        return e.id === id;
    });

    nomInput.value = etudiant.nom;
    prenomInput.value = etudiant.prenom;
    emailInput.value = etudiant.email;
    classeSelect.value = etudiant.classe;
    noteInput.value = etudiant.note;

    idEnModification = id;
    boutonAjouter.textContent = 'Enregistrer les modifications';
}

//  SUPPRIMER
function supprimerEtudiant(id) {
    const confirmation = confirm('Voulez-vous vraiment supprimer cet étudiant ?');

    if (confirmation) {
        // On garde tous les étudiants SAUF celui qu'on supprime
        etudiants = etudiants.filter(function (e) {
            return e.id !== id;
        });
        sauvegarder();
        afficherEtudiants();
    }
}

// REINITIALISER
boutonReset.addEventListener('click', function () {
    if (confirm('Réinitialiser toutes les données ?')) {
        etudiants = [];
        idEnModification = null;
        boutonAjouter.textContent = "Ajouter l'étudiant";
        sauvegarder();
        afficherEtudiants();
    }
});

// FILTRES ET RECHERCHE
function getEtudiantsFiltres() {
    const resultat = [];
    const recherche = rechercheInput.value.toLowerCase();

    for (let i = 0; i < etudiants.length; i++) {
        const e = etudiants[i];
        let garder = true;

        // Filtre par résultat
        if (filtreResultat.value.includes('ADMIS') && e.note < 10) {
            garder = false;
        }
        if (filtreResultat.value.includes('Echecs') && e.note >= 10) {
            garder = false;
        }

        // Filtre par classe
        if (filtreClasse.value !== 'Toutes les classes' && e.classe !== filtreClasse.value) {
            garder = false;
        }

        // Recherche par nom, prénom, email ou classe
        if (recherche !== '') {
            const texte = (e.nom + ' ' + e.prenom + ' ' + e.email + ' ' + e.classe).toLowerCase();
            if (!texte.includes(recherche)) {
                garder = false;
            }
        }

        if (garder) {
            resultat.push(e);
        }
    }

    return resultat;
}

filtreResultat.addEventListener('change', afficherEtudiants);
filtreClasse.addEventListener('change', afficherEtudiants);
rechercheInput.addEventListener('input', afficherEtudiants);

// AFFICHER LES ETUDIANTS
function afficherEtudiants() {
    const liste = getEtudiantsFiltres();

    affiche.textContent = liste.length + ' étudiants affichés sur ' + etudiants.length + ' au total';

    if (liste.length === 0) {
        // Rien à afficher : on remet le message "vide"
        repertoire.classList.add('recherche');
        repertoire.innerHTML = etatVide;
    } else {
        repertoire.classList.remove('recherche');

        let html = '';
        for (let i = 0; i < liste.length; i++) {
            const e = liste[i];

            // Admis ou Échec ?
            let resultat = '❌';
            let classeBadge = 'badge-echec';
            if (e.note >= 10) {
                resultat = '✅';
                classeBadge = 'badge-admis';
            }

            html += `
                <div class="etudiant ligne-etudiant">
                    <p>${i + 1}</p>
                    <p>${e.prenom} ${e.nom}</p>
                    <p>${e.email}</p>
                    <p>${e.classe}</p>
                    <p>${e.note}/20 <span class="badge ${classeBadge}">${resultat}</span></p>
                    <p>
                        <button class="btn-modif" onclick="modifierEtudiant(${e.id})" title="Modifier">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-suppr" onclick="supprimerEtudiant(${e.id})" title="Supprimer">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </p>
                </div>
            `;
        }
        repertoire.innerHTML = html;
    }

    calculerStatistiques();
}

//  STATISTIQUES
function calculerStatistiques() {
    const total = etudiants.length;
    let nbAdmis = 0;
    let nbEchecs = 0;
    let somme = 0;
    let meilleure = 0;
    let basse = 20;

    for (let i = 0; i < etudiants.length; i++) {
        const note = etudiants[i].note;

        if (note >= 10) {
            nbAdmis++;
        } else {
            nbEchecs++;
        }

        somme = somme + note;

        if (note > meilleure) {
            meilleure = note;
        }
        if (note < basse) {
            basse = note;
        }
    }

    totalEl.textContent = total;
    admisEl.textContent = nbAdmis;
    echecEl.textContent = nbEchecs;

    if (total === 0) {
        pourcentageEchecEl.textContent = "0%";
        reussiteEl.textContent = "0%";
        moyenneEl.textContent = '00/20';
        meilleureEl.textContent = '00/20';
        basseEl.textContent = '00/20';
    } else {
        const pourcentageEchec = Math.round((nbEchecs / total) * 100);
        const pourcentageReussite = Math.round((nbAdmis / total) * 100);

        reussiteEl.textContent = pourcentageReussite + "%";
        echecEl.textContent = nbEchecs;
        pourcentageEchecEl.textContent = pourcentageEchec + "%";
        moyenneEl.textContent = (somme / total).toFixed(2) + '/20';
        meilleureEl.textContent = meilleure + '/20';
        basseEl.textContent = basse + '/20';
    }
}

//  afficher ce qui est déjà sauvegardé
afficherEtudiants();