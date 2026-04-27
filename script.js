// ========================================
// SEBO LITERARIO - CONVEX BACKEND
// ========================================

// ESTADO GLOBAL
let convex = null;
let currentUser = null;

// ========== INICIALIZAR CONVEX ==========
async function initConvex() {
  // Pegar URL injetada no HTML
  const convexUrl = window.__CONVEX_URL__;
  
  if (!convexUrl) {
    console.error('❌ CONVEX_URL não está configurada no HTML!');
    return;
  }
  
  if (typeof ConvexHttpClient !== 'undefined') {
    convex = new ConvexHttpClient(convexUrl);
    console.log('✅ Convex inicializado:', convexUrl);
    
    // Carregar usuário da sessão se existir
    const saved = sessionStorage.getItem('currentUser');
    if (saved) {
      currentUser = JSON.parse(saved);
      console.log('✅ Usuário restaurado:', currentUser.name);
    }
  } else {
    console.error('❌ ConvexHttpClient não disponível no window');
  }
}

// ========== AUTENTICAÇÃO COM CONVEX ==========
async function registerUser() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  
  if (!name || !email || !password) {
    showAlert('Por favor, preencha todos os campos', 'warning');
    return;
  }
  
  if (password.length < 6) {
    showAlert('Senha deve ter pelo menos 6 caracteres', 'warning');
    return;
  }
  
  if (!convex) {
    showAlert('❌ Convex não está inicializado', 'danger');
    return;
  }
  
  try {
    // Chamar função de registro no Convex backend
    const user = await convex.mutation('users:registerUser', {
      name,
      email,
      password
    });
    
    if (user) {
      currentUser = user;
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      showAlert('✅ Cadastro realizado com sucesso!', 'success');
      document.getElementById('registerForm').reset();
      
      setTimeout(() => {
        showScreen('home');
        loadBooks();
        updateNavigation();
      }, 1000);
    }
  } catch (error) {
    console.error('Erro ao registrar:', error);
    showAlert('Erro: ' + (error.message || 'Falha ao registrar'), 'danger');
  }
}

async function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showAlert('Por favor, preencha email e senha', 'warning');
    return;
  }
  
  if (!convex) {
    showAlert('❌ Convex não está inicializado', 'danger');
    return;
  }
  
  try {
    // Chamar função de login no Convex backend
    const user = await convex.mutation('users:loginUser', {
      email,
      password
    });
    
    if (user) {
      currentUser = user;
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      showAlert('✅ Login realizado com sucesso!', 'success');
      document.getElementById('loginForm').reset();
      
      setTimeout(() => {
        showScreen('home');
        loadBooks();
        updateNavigation();
      }, 1000);
    } else {
      showAlert('Email ou senha incorretos', 'danger');
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    showAlert('Email ou senha incorretos', 'danger');
  }
}

function logoutUser() {
  if (confirm('Tem certeza que deseja sair?')) {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    showScreen('login');
    updateNavigation();
    showAlert('✅ Logout realizado', 'info');
  }
}

function isLoggedIn() {
  const saved = sessionStorage.getItem('currentUser');
  if (saved) {
    currentUser = JSON.parse(saved);
    return !!currentUser;
  }
  return false;
}

// ========== GERENCIAMENTO DE LIVROS (CONVEX) ==========
async function addBook() {
  if (!isLoggedIn()) {
    showAlert('Por favor, faça login primeiro', 'warning');
    return;
  }
  
  const title = document.getElementById('bookTitle').value.trim();
  const author = document.getElementById('bookAuthor').value.trim();
  const genre = document.getElementById('bookGenre').value;
  const description = document.getElementById('bookDescription').value.trim();
  const file = document.getElementById('bookPDF').files[0];
  
  if (!title || !author || !genre || !file) {
    showAlert('Por favor, preencha todos os campos', 'warning');
    return;
  }
  
  if (!convex) {
    showAlert('❌ Convex não está inicializado', 'danger');
    return;
  }
  
  try {
    // Ler arquivo como base64
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        // Criar livro no Convex
        const book = await convex.mutation('books:addBook', {
          title,
          author,
          genre,
          description,
          fileName: file.name,
          fileData: e.target.result // base64
        });
        
        if (book) {
          showAlert('✅ Livro adicionado com sucesso!', 'success');
          document.getElementById('addBookForm').reset();
          loadBooks();
          showScreen('home');
        }
      } catch (error) {
        console.error('Erro ao adicionar livro:', error);
        showAlert('Erro: ' + error.message, 'danger');
      }
    };
    
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    showAlert('Erro ao processar arquivo', 'danger');
  }
}

async function loadBooks() {
  if (!isLoggedIn() || !convex) return;
  
  try {
    // Buscar livros do usuário no Convex
    const books = await convex.query('books:getUserBooks');
    displayBooks(books || []);
  } catch (error) {
    console.error('Erro ao carregar livros:', error);
    showAlert('Erro ao carregar livros', 'danger');
  }
}

function displayBooks(books) {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  if (books.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          📚 Nenhum livro adicionado ainda. <a href="#" onclick="showScreen('add')">Adicione um!</a>
        </div>
      </div>
    `;
    return;
  }
  
  books.forEach(book => {
    const bookCard = document.createElement('div');
    bookCard.className = 'col';
    bookCard.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <div class="book-cover mb-3 text-center" style="font-size: 3rem;">${book.cover}</div>
          <h5 class="card-title">${book.title}</h5>
          <p class="card-text text-muted small">por <strong>${book.author}</strong></p>
          <p class="card-text small"><span class="badge bg-primary">${book.genre}</span></p>
          <p class="card-text small">${book.description || 'Sem descrição'}</p>
          <div class="d-grid gap-2">
            <button class="btn btn-sm btn-primary" onclick="openBook('${book.id}')">📖 Ler</button>
            <button class="btn btn-sm btn-danger" onclick="deleteBook('${book.id}')">🗑️ Deletar</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(bookCard);
  });
}

function deleteBook(bookId) {
  if (!isLoggedIn() || !convex) return;
  
  if (!confirm('Tem certeza que deseja deletar este livro?')) return;
  
  convex.mutation('books:deleteBook', { bookId })
    .then(() => {
      showAlert('✅ Livro deletado', 'success');
      loadBooks();
    })
    .catch(error => {
      console.error('Erro ao deletar livro:', error);
      showAlert('Erro ao deletar livro', 'danger');
    });
}

async function openBook(bookId) {
  if (!isLoggedIn() || !convex) return;
  
  try {
    // Buscar livro específico
    const book = await convex.query('books:getBook', { bookId });
    
    if (book) {
      sessionStorage.setItem('currentBook', JSON.stringify(book));
      showScreen('reader');
      loadPdfReader(book);
    }
  } catch (error) {
    console.error('Erro ao abrir livro:', error);
    showAlert('Erro ao abrir livro', 'danger');
  }
}

function loadPdfReader(book) {
  const readerContent = document.getElementById('readerContent');
  const bookTitle = document.getElementById('bookTitle');
  
  if (bookTitle) bookTitle.textContent = book.title;
  
  if (readerContent) {
    readerContent.innerHTML = `
      <div class="mb-3">
        <h2>${book.title}</h2>
        <p class="text-muted">Autor: <strong>${book.author}</strong></p>
        <p><small>Gênero: ${book.genre}</small></p>
        <hr>
        <p>${book.description || 'Sem descrição disponível'}</p>
        <div class="alert alert-info mt-3">
          📄 Arquivo: ${book.fileName}
        </div>
        <iframe src="${book.fileData}" style="width: 100%; height: 600px; border: 1px solid #ddd;"></iframe>
      </div>
    `;
  }
}

// ========== PERFIL ==========
async function saveProfile() {
  if (!isLoggedIn() || !convex) return;
  
  const newName = document.getElementById('profileName').value.trim();
  
  if (!newName) {
    showAlert('Por favor, digite um nome', 'warning');
    return;
  }
  
  try {
    const updated = await convex.mutation('users:updateProfile', {
      name: newName
    });
    
    if (updated) {
      currentUser.name = newName;
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      showAlert('✅ Perfil atualizado!', 'success');
      updateNavigation();
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    showAlert('Erro ao atualizar perfil', 'danger');
  }
}

function showProfile() {
  if (!isLoggedIn()) return;
  
  document.getElementById('profileName').value = currentUser.name;
  document.getElementById('profileEmail').value = currentUser.email;
  
  showScreen('profile');
}

// ========== UI HELPERS ==========
function showAlert(message, type = 'info') {
  // Criar elemento de alerta
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

function showScreen(screenName) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));
  
  const screen = document.getElementById(screenName + 'Screen');
  if (screen) {
    screen.classList.add('active');
  }
}

function toggleMobileMenu() {
  const menu = document.getElementById('navMenu');
  if (menu) menu.classList.toggle('d-none');
}

function updateNavigation() {
  const navButtons = document.getElementById('navButtons');
  if (!navButtons) return;
  
  if (isLoggedIn()) {
    navButtons.innerHTML = `
      <button class="btn btn-outline-secondary btn-sm" onclick="showProfile()">👤 ${currentUser.name}</button>
      <button class="btn btn-outline-danger btn-sm" onclick="logoutUser()">🚪 Sair</button>
    `;
  } else {
    navButtons.innerHTML = `
      <button class="btn btn-outline-primary btn-sm" onclick="showScreen('login')">🔓 Login</button>
      <button class="btn btn-primary btn-sm" onclick="showScreen('register')">✏️ Cadastro</button>
    `;
  }
}

function showProfile() {
  if (!isLoggedIn()) return;
  
  document.getElementById('profileName').value = currentUser.name;
  document.getElementById('profileEmail').value = currentUser.email;
  
  showScreen('profile');
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function changeFontSize(size) {
  const reader = document.getElementById('readerContent');
  if (reader) {
    reader.className = reader.className.replace(/font-\w+/g, '') + ' font-' + size;
  }
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async function() {
  // Restaurar tema
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  
  // Inicializar Convex
  await initConvex();
  
  // Configurar formulários
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginUser();
    });
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      registerUser();
    });
  }
  
  const addBookForm = document.getElementById('addBookForm');
  if (addBookForm) {
    addBookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addBook();
    });
  }
  
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfile();
    });
  }
  
  // Determinar tela inicial
  if (isLoggedIn()) {
    showScreen('home');
    loadBooks();
    updateNavigation();
  } else {
    showScreen('login');
    updateNavigation();
  }
  
  // Pesquisa e filtro
  const searchInput = document.getElementById('searchInput');
  const genreFilter = document.getElementById('genreFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterBooks);
  }
  
  if (genreFilter) {
    genreFilter.addEventListener('change', filterBooks);
  }
});

function filterBooks() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const genreFilter = document.getElementById('genreFilter').value;
  
  // Filtrar cards já exibidos
  const cards = document.querySelectorAll('#booksGrid .card');
  cards.forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const author = card.querySelector('.card-text').textContent.toLowerCase();
    const genre = card.querySelector('.badge').textContent;
    
    const matchesSearch = title.includes(searchTerm) || author.includes(searchTerm);
    const matchesGenre = !genreFilter || genre === genreFilter;
    
    card.parentElement.style.display = (matchesSearch && matchesGenre) ? '' : 'none';
  });
}

function goBackFromReader() {
  showScreen('home');
}
