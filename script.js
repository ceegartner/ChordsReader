const chordsHighlightOpacityValue = 0.15;
let chordsHighlighted = true;
var hyphensVisible = true;
var scrollInterval;
var isScrolling = false;
let scrollSpeed = 25 ; // en px/sec
var chordsMapping = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];


// Définition des couleurs pour chaque type d'accord
const chordColors = {
    'Am': 'rgb(255, 0, 0)',
    'A': 'rgb(200, 0, 0)',
    'C': 'rgb(255, 192, 0)',
    'F': 'rgb(0, 192, 0)', 
    'G': 'rgb(128, 128, 255)'
};


document.addEventListener("DOMContentLoaded", function() {


    document.documentElement.style.setProperty('--chord-opacity', chordsHighlightOpacityValue);

    const chords = document.querySelectorAll('.chord');
    chords.forEach(chord => {
        chord.innerHTML = chord.innerHTML.replace(/-/g, '&#8209;'); // transforme les tirets en tirets insécables
        let chordName = chord.getAttribute('name');
        chordName = chordName.replace('maj7','').replace('7','').replace('dim','').replace('aug','').replace('sus','').replace('add','');
        let color = chordColors[chordName] || '#DDD'; // Couleur par défaut si non définie
        chord.style.setProperty('--chord-color', color);
        chord.setAttribute('original-chord', chordName);
    });

    WriteAndColorizeChords();

    // getAlbumCover();

    document.getElementById('autoscrollButton').addEventListener('click', function() {
        if (isScrolling) {
            stopAutoScroll();
            isScrolling = false;
            this.textContent = "Autoscroll";
        } else {
            startAutoScroll();
            isScrolling = true;
            this.textContent = "Stop Scrolling";
        }
    });

    document.getElementById('transposeUp').addEventListener('click', function() {
        transposeChords(1);
    });

    document.getElementById('transposeDown').addEventListener('click', function() {
        transposeChords(-1);
    });

    document.getElementById('highlightChords').addEventListener('click', function() {
        chordsHighlighted = !chordsHighlighted;
        document.documentElement.style.setProperty('--chord-opacity', chordsHighlighted ? chordsHighlightOpacityValue : 0);
        WriteAndColorizeChords();
    });

    const song = document.querySelector('.song');
    let columnCount = 1;
    
    document.getElementById('toggleColumns').addEventListener('click', function() {
        columnCount = columnCount < 4 ? columnCount + 1 : 1;
        song.style.columnCount = columnCount;
    });


    const increaseSizeButton = document.getElementById('increaseText');
    const decreaseSizeButton = document.getElementById('decreaseText');
    const increaseSpacingButton = document.getElementById('increaseSpacing');
    const decreaseSpacingButton = document.getElementById('decreaseSpacing');

    let textScale = 1; // Echelle de la police
    let spacing = 1; // Espacement entre les lignes

    increaseSizeButton.addEventListener('click', function() {
        textScale += 0.1;
        updateFontSize();
    });

    decreaseSizeButton.addEventListener('click', function() {
        textScale -= 0.1;
        updateFontSize();
    });

    increaseSpacingButton.addEventListener('click', function() {
        spacing += 0.1;
        updateSpacing();
    });

    decreaseSpacingButton.addEventListener('click', function() {
        spacing -= 0.1;
        updateSpacing();
    });

    function updateFontSize() {
        document.documentElement.style.setProperty('--textScale', textScale);
    }

    function updateSpacing() {
        document.documentElement.style.setProperty('--spacing', spacing);
    }
    

});

function startAutoScroll() {
    scrollInterval = setInterval(function() {
        window.scrollBy(0, 1); // Vous pouvez ajuster la valeur pour changer la vitesse de défilement
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            clearInterval(scrollInterval);
            isScrolling = false;
            document.getElementById('autoscrollButton').textContent = "Autoscroll";
        }
    }, 1/(scrollSpeed/1000)); // Vous pouvez ajuster l'intervalle pour changer la vitesse de défilement
}

function stopAutoScroll() {
    clearInterval(scrollInterval);
}


function WriteAndColorizeChords() {
    const chords = document.querySelectorAll('.chord');

    // Parcourir chaque élément d'accord
    chords.forEach(chord => {

        const chordName = chord.getAttribute('original-chord');
        let color = chordColors[chordName] || '#DDD'; // Couleur par défaut si non définie

        // Appliquer la couleur de fond au texte de l'accord
        chord.style.backgroundColor = color.replace(')',', ' + document.documentElement.style.getPropertyValue('--chord-opacity') + ')');
        chord.style.marginRight = chordsHighlighted ? 'calc(4px * var(--textScale))' : '0';

        var content = chord.innerHTML;
        if (!chordsHighlighted) {
            if (content.endsWith('‑')) {
                chord.innerHTML = chord.innerHTML.slice(0, -1);
                chord.classList.add('hyphen-hidden-end');
            }
            if (content.startsWith('‑')) {
                chord.innerHTML = chord.innerHTML.slice(1);
                chord.classList.add('hyphen-hidden-start');
            }
        } else {
            if (chord.classList.contains('hyphen-hidden-start')) {
                chord.innerHTML = '‑' + chord.innerHTML;
                chord.classList.remove('hyphen-hidden-start');
            }
            if (chord.classList.contains('hyphen-hidden-end')) {
                chord.innerHTML += '‑';
                chord.classList.remove('hyphen-hidden-end');
            }
        }
    });
    hyphensVisible = !hyphensVisible;
}


function transposeChord(chord, steps) {
    var chordRoot = chord.match(/^[A-G]#?/)[0];
    var chordSuffix = chord.slice(chordRoot.length);
    var chordIndex = chordsMapping.indexOf(chordRoot);
    if (chordIndex === -1) return chord;
    var newChordIndex = (chordIndex + steps + 12) % 12;
    return chordsMapping[newChordIndex] + chordSuffix;
}

function transposeChords(steps) {
    var chords = document.querySelectorAll('.chord');
    chords.forEach(function(chordElement) {
        var chordName = chordElement.getAttribute('name');
        var transposedChord = transposeChord(chordName, steps);
        chordElement.setAttribute('name', transposedChord);
        //chordElement.textContent = chordElement.textContent.replace(chordName, transposedChord);
    });
}


function getAlbumCover() {

    const strArtist = document.getElementById('song-artist').textContent.replace(' ', '_');
    const strAlbum = document.getElementById('song-album').textContent;

    const query = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX dbpedia2: <http://dbpedia.org/property/>
        PREFIX owl: <http://dbpedia.org/ontology/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT DISTINCT ?albumName, ?coverArt WHERE {
            ?album rdf:type owl:MusicalWork .
            ?album dbpedia2:artist <http://dbpedia.org/resource/${strArtist}> .
            ?album rdfs:label ?albumName .
            ?album dbpedia2:cover ?coverArt .
            FILTER (regex(?albumName, "${strAlbum}", "i"))
        }
        LIMIT 1
        `;
    const encodedQuery = encodeURIComponent(query);
    const endpointUrl = "http://dbpedia.org/sparql";
    const url = `${endpointUrl}?query=${encodedQuery}&format=json`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Traitement des résultats ici
        const results = data.results.bindings;
        if (results.length > 0) {
            results.forEach(result => {
                console.log(`Album: ${result.albumName.value}`);
                console.log(`Cover Art URL: ${result.coverArt.value}`);
                const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
                const url2 = `https://en.wikipedia.org/w/api.php?format=xml&action=query&prop=imageinfo&iiprop=url|size&titles=File:${result.coverArt.value}`;
                fetch(proxyUrl + url2)
                .then(response => response.text()) 
                .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                .then(data => {
                    console.log(data);
                    const ii = data.querySelector("ii");  // Sélectionner l'élément <ii> qui contient l'info de l'image
                    const imageUrl = ii.getAttribute("url");  // Obtenir l'URL de l'image
                    console.log('Image URL:', imageUrl);
                    document.getElementById('album-image').src = imageUrl;
                });
            });
        } else {
            console.log("No results found.");
        }
    })
    .catch(error => {
        console.error("Error fetching data: ", error);
    });

}