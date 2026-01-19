let currentPage = 1;
const itemsPerPage = 12;
let allCharacters = [];
let filteredCharacters = [];

function createCharacterCard(character) {
    return `
        <div class="col">
            <div class="character-card card h-100">
                <img src="${character.image}" class="card-img-top" alt="${character.name}"
                     onerror="this.src='https://via.placeholder.com/400x400/f8f9fa/2c3e50?text=${encodeURIComponent(character.name)}'">
                <div class="card-body">
                    <h5 class="card-title">${character.name}</h5>
                    <button class="btn btn-info" data-bs-toggle="modal" data-bs-target="#characterModal"
                            onclick="showCharacterDetails(${character.id})">Ver Detalles</button>
                </div>
            </div>
        </div>
    `;
}

async function fetchCharacters() {
    try {
        const response = await fetch('https://dragonball-api.com/api/characters?limit=1000');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching characters:', error);
        return null;
    }
}

function createPaginationButtons(meta) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (meta.totalPages <= 1) return;

    // Botón Previous
    pagination.innerHTML += `
        <li class="page-item ${meta.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${meta.currentPage - 1}">Previous</a>
        </li>
    `;

    // Mostrar solo páginas cercanas
    const maxPagesToShow = 5;
    let startPage = Math.max(1, meta.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(meta.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Números de página
    for (let i = startPage; i <= endPage; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === meta.currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    // Botón Next
    pagination.innerHTML += `
        <li class="page-item ${meta.currentPage === meta.totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${meta.currentPage + 1}">Next</a>
        </li>
    `;

    // Event listeners
    pagination.querySelectorAll('.page-link').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const newPage = parseInt(e.target.getAttribute('data-page'));
            if (newPage !== currentPage && newPage > 0 && newPage <= meta.totalPages) {
                currentPage = newPage;
                updateDisplayedCharacters();
                createPaginationButtons({
                    currentPage,
                    totalPages: Math.ceil(filteredCharacters.length / itemsPerPage)
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

function filterCharactersByName(characters, name) {
    return characters.filter(character =>
        character.name.toLowerCase().includes(name.toLowerCase())
    );
}

function paginateCharacters(characters, page, itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;
    return characters.slice(startIndex, endIndex);
}

async function displayCharacters() {
    const container = document.getElementById('characterContainer');
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="loading-text">Cargando personajes de Dragon Ball...</p>
        </div>
    `;

    const charactersData = await fetchCharacters();

    if (charactersData && charactersData.items) {
        allCharacters = charactersData.items;
        filteredCharacters = allCharacters;
        updateDisplayedCharacters();
        createPaginationButtons({
            currentPage,
            totalPages: Math.ceil(filteredCharacters.length / itemsPerPage)
        });
    } else {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" style="background: rgba(231, 76, 60, 0.2); border: 2px solid #e74c3c;">
                    <h4>❌ Error loading characters</h4>
                    <p>Please try again later.</p>
                    <button class="btn btn-primary mt-3" onclick="displayCharacters()">
                        🔄 Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function updateDisplayedCharacters() {
    const container = document.getElementById('characterContainer');
    container.innerHTML = '';

    const paginatedCharacters = paginateCharacters(filteredCharacters, currentPage, itemsPerPage);

    if (paginatedCharacters.length > 0) {
        paginatedCharacters.forEach(character => {
            container.innerHTML += createCharacterCard(character);
        });
    } else {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning" style="background: rgba(243, 156, 18, 0.2); border: 2px solid #f39c12;">
                    <h4>🔍 No characters found</h4>
                    <p>Try a different search term</p>
                </div>
            </div>
        `;
    }
}

function searchCharacters() {
    const searchInput = document.getElementById('searchInput').value;
    filteredCharacters = filterCharactersByName(allCharacters, searchInput);
    currentPage = 1;
    updateDisplayedCharacters();
    createPaginationButtons({
        currentPage,
        totalPages: Math.ceil(filteredCharacters.length / itemsPerPage)
    });
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    filteredCharacters = allCharacters;
    currentPage = 1;
    updateDisplayedCharacters();
    createPaginationButtons({
        currentPage,
        totalPages: Math.ceil(filteredCharacters.length / itemsPerPage)
    });
}

function showCharacterDetails(characterId) {
    const character = allCharacters.find(c => c.id === characterId);
    if (character) {
        document.getElementById('characterName').textContent = character.name;
        document.getElementById('characterDescription').textContent =
            character.description || 'No description available';
        document.getElementById('characterImage').src =
            character.image || 'https://via.placeholder.com/300';

        const characterDetails = document.getElementById('characterDetails');
        characterDetails.innerHTML = `
            <li class="list-group-item"><strong>Species:</strong> ${character.species || 'N/A'}</li>
            <li class="list-group-item"><strong>Gender:</strong> ${character.gender || 'N/A'}</li>
            <li class="list-group-item"><strong>Ki:</strong> ${character.ki || 'N/A'}</li>
            <li class="list-group-item"><strong>Affiliation:</strong> ${character.affiliation || 'N/A'}</li>
        `;

        const modalElement = document.getElementById('characterModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // Asegurar que el modal se cierre correctamente
        modalElement.addEventListener('hidden.bs.modal', function () {
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }, { once: true });
    }
}

// Event listeners
// Búsqueda en tiempo real mientras escribes
document.getElementById('searchInput').addEventListener('input', searchCharacters);

// Búsqueda con Enter
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchCharacters();
    }
});

// Inicializar
displayCharacters();