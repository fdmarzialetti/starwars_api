const url = "https://swapi.info/api/people";

const loader = document.getElementById("character-loader");

const showLoader = () => loader.classList.remove("hidden");
const hideLoader = () => loader.classList.add("hidden");

const cantCharactersPerPage = 6;

let allCharacters = [];
let currentPage = 1;
let totalPages = 0;

/* ================================
FETCH INICIAL (SOLO UNA VEZ)
================================ */
const fetchCharacters = () => {
    return fetch(url)
        .then(res => {
            if (!res.ok)
                throw new Error("Network response was not ok");
            return res.json();
        });
};

/* ================================
RENDER DE PAGINACIÓN
================================ */
const renderPage = (page) => {

    const startIndex = (page - 1) * cantCharactersPerPage;
    const endIndex = startIndex + cantCharactersPerPage;

    const charactersToShow = allCharacters.slice(startIndex, endIndex);

    const charactersList = document.getElementById("characters-list");

    charactersList.innerHTML = charactersToShow
        .map(char => `
            <li data-url="${char.url}">
                ${char.name}
            </li>
        `)
        .join("");

    document.querySelector(".actual-page").textContent = page + "/";
    document.querySelector(".total-pages").textContent = totalPages;

    document.querySelector(".prev-button").disabled = page === 1;
    document.querySelector(".next-button").disabled = page === totalPages;
};

/* ================================
BOTONES NEXT / PREV
================================ */
const nextPage = () => {
    if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
    }
};

const prevPage = () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
};

/* ================================
INFO PERSONAJE
================================ */
const getCharacterInfo = async (event) => {

    const characterUrl = event.target.dataset.url;
    if (!characterUrl) return;

    try {
        showLoader();

        // 🔥 Delay mínimo de 2 segundos
        const delay = new Promise(resolve =>
            setTimeout(resolve, 800)
        );

        // 🔥 Fetch personaje
        const characterResponse = await fetch(characterUrl);
        const character = await characterResponse.json();

        // 🔥 Requests en paralelo
        const planetPromise = fetch(character.homeworld)
            .then(res => res.json());

        const filmsPromise = Promise.all(
            character.films.map(filmUrl =>
                fetch(filmUrl).then(res => res.json())
            )
        );

        // 🔥 Espera todo + delay
        const [planet, films] = await Promise.all([
            planetPromise,
            filmsPromise,
            delay
        ]);

        // ======================
        // RENDER PERSONAJE
        // ======================
        document.getElementById("name").textContent =
            "Name: " + character.name;

        document.getElementById("birth").textContent =
            "Birth: " + character.birth_year;

        document.getElementById("planet").textContent =
            "Planet: " + planet.name;

        // ======================
        // RENDER PELÍCULAS
        // ======================
        const moviesList = document.getElementById("list-films");

        moviesList.innerHTML = films
            .map(film => `<li>${film.title}</li>`)
            .join("");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        hideLoader(); // 🔥 siempre se ejecuta
    }
};

/* ================================
PELÍCULAS (la dejamos igual)
================================ */
async function characterAppearanceFilm(films) {

    const moviesList = document.getElementById("list-films");
    moviesList.innerHTML = "";

    for (const filmUrl of films) {
        try {
            const response = await fetch(filmUrl);
            const data = await response.json();

            const li = document.createElement("li");
            li.textContent = data.title;
            moviesList.appendChild(li);

        } catch (error) {
            console.error("Error al cargar la película:", error);
        }
    }
}

/* ================================
INICIALIZACIÓN
================================ */
window.onload = () => {

    fetchCharacters()
        .then(data => {
            allCharacters = data;
            totalPages = Math.ceil(
                allCharacters.length / cantCharactersPerPage
            );

            renderPage(currentPage);
        })
        .catch(err => console.error(err));

    document
        .getElementById("characters-list")
        .addEventListener("click", getCharacterInfo);

    document
        .querySelector(".next-button")
        .addEventListener("click", nextPage);

    document
        .querySelector(".prev-button")
        .addEventListener("click", prevPage);
};