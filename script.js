// ========================================
// SEBO - SISTEMA COMPLETO FUNCIONAL
// ========================================

// ========== ESTADO GLOBAL ==========
let convex = null;
let currentUser = null;

// ========== INICIALIZAÇÃO CONVEX ==========
function initConvex() {
  // URL do Convex deve estar definida via variável de ambiente VITE_CONVEX_URL
  const convexUrl = import.meta.env.VITE_CONVEX_URL || window.__CONVEX_URL__;
  
  if (!convexUrl) {
    console.warn('⚠️ Convex URL não configurada. Configure VITE_CONVEX_URL nas variáveis de ambiente');
    return;
  }
  
  if (typeof ConvexHttpClient !== 'undefined') {
    convex = new ConvexHttpClient(convexUrl);
    console.log('✅ Convex inicializado com:', convexUrl);
  } else {
    console.warn('⚠️ ConvexHttpClient não disponível');
  }
}

// ========== AUTENTICAÇÃO ==========
function registerUser() {
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
  
  // Salvar usuário em localStorage
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  
  if (users[email]) {
    showAlert('Este email já está registrado', 'danger');
    return;
  }
  
  users[email] = {
    id: Date.now().toString(),
    name,
    email,
    password: btoa(password), // Simples criptografia base64
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', email);
  currentUser = users[email];
  
  showAlert('✅ Cadastro realizado com sucesso!', 'success');
  document.getElementById('registerForm').reset();
  
  setTimeout(() => {
    showScreen('home');
    updateNavigation();
  }, 1000);
}

function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showAlert('Por favor, preencha email e senha', 'warning');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const user = users[email];
  
  if (!user || user.password !== btoa(password)) {
    showAlert('Email ou senha incorretos', 'danger');
    return;
  }
  
  localStorage.setItem('currentUser', email);
  currentUser = user;
  
  showAlert('✅ Login realizado com sucesso!', 'success');
  document.getElementById('loginForm').reset();
  
  setTimeout(() => {
    showScreen('home');
    loadBooks();
    updateNavigation();
  }, 1000);
}

function logoutUser() {
  if (confirm('Tem certeza que deseja sair?')) {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showScreen('login');
    updateNavigation();
    showAlert('✅ Logout realizado', 'info');
  }
}

function isLoggedIn() {
  const email = localStorage.getItem('currentUser');
  if (email) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    currentUser = users[email];
    return !!currentUser;
  }
  return false;
}

// ========== GERENCIAMENTO DE LIVROS ==========
function addBook() {
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
  
  // Ler arquivo como base64
  const reader = new FileReader();
  reader.onload = function(e) {
    const books = JSON.parse(localStorage.getItem('books') || '{}');
    const userBooks = books[currentUser.email] || [];
    
    const newBook = {
      id: Date.now().toString(),
      title,
      author,
      genre,
      description,
      fileName: file.name,
      fileData: e.target.result, // Base64
      cover: '📖',
      addedAt: new Date().toISOString()
    };
    
    userBooks.push(newBook);
    books[currentUser.email] = userBooks;
    localStorage.setItem('books', JSON.stringify(books));
    
    showAlert('✅ Livro adicionado com sucesso!', 'success');
    document.getElementById('addBookForm').reset();
    loadBooks();
    showScreen('home');
  };
  
  reader.readAsDataURL(file);
}

function loadBooks() {
  if (!isLoggedIn()) return;
  
  const books = JSON.parse(localStorage.getItem('books') || '{}');
  const userBooks = books[currentUser.email] || [];
  
  displayBooks(userBooks);
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
  if (!isLoggedIn()) return;
  
  if (!confirm('Tem certeza que deseja deletar este livro?')) return;
  
  const books = JSON.parse(localStorage.getItem('books') || '{}');
  const userBooks = books[currentUser.email] || [];
  
  books[currentUser.email] = userBooks.filter(b => b.id !== bookId);
  localStorage.setItem('books', JSON.stringify(books));
  
  showAlert('✅ Livro deletado', 'success');
  loadBooks();
}

function openBook(bookId) {
  if (!isLoggedIn()) return;
  
  const books = JSON.parse(localStorage.getItem('books') || '{}');
  const userBooks = books[currentUser.email] || [];
  const book = userBooks.find(b => b.id === bookId);
  
  if (book) {
    localStorage.setItem('currentBook', JSON.stringify(book));
    showScreen('reader');
    loadPdfReader(book);
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

// ========== PERFIL E CONFIGURAÇÕES ==========
function saveProfile() {
  if (!isLoggedIn()) return;
  
  const newName = document.getElementById('profileName').value.trim();
  
  if (!newName) {
    showAlert('Por favor, digite um nome', 'warning');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  users[currentUser.email].name = newName;
  localStorage.setItem('users', JSON.stringify(users));
  currentUser.name = newName;
  
  showAlert('✅ Perfil atualizado!', 'success');
  updateNavigation();
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
      <button class="btn btn-outline-info btn-sm" onclick="showScreen('settings')">⚙️ Config</button>
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
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar Convex
  initConvex();
  
  // Restaurar tema salvo
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  
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
  
  // Convex é configurado via variáveis de ambiente, não via frontend
  
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
  if (!isLoggedIn()) return;
  
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const genreFilter = document.getElementById('genreFilter').value;
  
  const books = JSON.parse(localStorage.getItem('books') || '{}');
  const userBooks = books[currentUser.email] || [];
  
  let filtered = userBooks;
  
  if (searchTerm) {
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(searchTerm) ||
      b.author.toLowerCase().includes(searchTerm)
    );
  }
  
  if (genreFilter) {
    filtered = filtered.filter(b => b.genre === genreFilter);
  }
  
  displayBooks(filtered);
}

function goBackFromReader() {
  showScreen('home');
}
