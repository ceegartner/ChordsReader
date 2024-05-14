

document.addEventListener("DOMContentLoaded", function() {


    WriteAndColorizeChords();

    // getAlbumCover();

    const button = document.getElementById('toggleColumns');
    const song = document.querySelector('.song');
    let columnCount = 1;
    
    button.addEventListener('click', function() {
        columnCount = columnCount < 4 ? columnCount + 1 : 1;
        song.style.columnCount = columnCount;
    });


    const increaseButton = document.getElementById('increaseText');
    const decreaseButton = document.getElementById('decreaseText');
    const textElements = document.querySelectorAll('.line'); // Cible les paragraphes dans .content

    let fontSize = 16; // Taille de police initiale

    increaseButton.addEventListener('click', function() {
        fontSize += 2;
        updateFontSize();
    });

    decreaseButton.addEventListener('click', function() {
        fontSize -= 2;
        updateFontSize();
    });

    function updateFontSize() {
        textElements.forEach(function(element) {
            element.style.fontSize = `${fontSize}px`;
            // WriteAndColorizeChords();
        });
    }

});


function WriteAndColorizeChords() {
    const chords = document.querySelectorAll('.chord');

    // Définition des couleurs pour chaque type d'accord
    const chordColors = {
        'Am': 'rgb(255, 0, 0)',
        'A': 'rgb(200, 0, 0)',
        'C': 'rgb(255, 192, 0)',
        'F': 'rgb(0, 192, 0)', 
        'G': 'rgb(128, 128, 255)'
    };

    // Parcourir chaque élément d'accord
    chords.forEach(chord => {
        const chordName = chord.getAttribute('name');
        const color = chordColors[chordName] || '#DDD'; // Couleur par défaut si non définie
        chord.style.setProperty('--chord-color', color);

        // Appliquer la couleur de fond au texte de l'accord
        chord.style.backgroundColor = color.replace(')', ', 0.15)'); // Ajouter de la transparence
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