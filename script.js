// ========================================
// SEBO - SCRIPT.JS PRINCIPAL
// ========================================

// ========== INICIALIZAR CONVEX ==========
// URL deve ser configurada em .env.local como VITE_CONVEX_URL
const CONVEX_URL = 'https://seu-projeto-id.convex.cloud'; // TODO: Replace com sua URL

let convex = null;

function initializeConvex(url) {
  try {
    // Verificar se ConvexHttpClient está disponível
    if (typeof ConvexHttpClient !== 'undefined') {
      convex = new ConvexHttpClient(url);
      console.log('✅ Convex inicializado com sucesso em:', url);
      return true;
    } else {
      console.error('❌ ConvexHttpClient não está disponível. Verifique se a biblioteca está carregada.');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Convex:', error);
    return false;
  }
}

/**
 * Configurar URL do Convex (salva no localStorage)
 */
function setConvexUrl(url) {
  try {
    localStorage.setItem('convexUrl', url);
    // Tentar reinicializar com a nova URL
    const success = initializeConvex(url);
    if (success) {
      alert('✅ URL do Convex configurada com sucesso!');
    }
    return success;
  } catch (error) {
    console.error('Erro ao configurar URL do Convex:', error);
    return false;
  }
}

/**
 * Obter URL atual do Convex
 */
function getConvexUrl() {
  return localStorage.getItem('convexUrl') || CONVEX_URL;
}

/**
 * Verificar se Convex está disponível
 */
function isConvexReady() {
  if (!convex) {
    console.warn('⚠️  Convex não foi inicializado. Configure a URL em Configurações.');
    return false;
  }
  return true;
}

// ========== FUNÇÕES DE NAVEGAÇÃO ==========

/**
 * Mostrar tela específica
 */
function showScreen(screenName) {
  // Ocultar todas as telas
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));
  
  // Mostrar tela solicitada
  const screen = document.getElementById(screenName + 'Screen');
  if (screen) {
    screen.classList.add('active');
  }
}

/**
 * Toggle menu móvel
 */
function toggleMobileMenu() {
  const menu = document.getElementById('navMenu');
  if (menu) {
    menu.classList.toggle('d-none');
  }
}

/**
 * Voltar da tela de leitura
 */
function goBackFromReader() {
  showScreen('home');
}

/**
 * Alternar tema (claro/escuro)
 */
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

/**
 * Mudar tamanho da fonte
 */
function changeFontSize(size) {
  const reader = document.getElementById('readerContent');
  if (reader) {
    reader.className = reader.className.replace(/font-\w+/g, '') + ' font-' + size;
  }
}

// ========== AUTENTICAÇÃO LOCAL (SEM CONVEX POR ENQUANTO) ==========

/**
 * Registrar novo usuário (localStorage)
 */
function registerUser(email, password, name) {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[email]) {
      return { success: false, error: 'Email já registrado' };
    }
    
    users[email] = { email, password, name, createdAt: Date.now() };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', email);
    
    showScreen('home');
    updateNavigation();
    
    return { success: true };
  } catch (error) {
    console.error("Erro no registro:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fazer login (localStorage)
 */
function loginUser(email, password) {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[email];
    
    if (!user || user.password !== password) {
      return { success: false, error: 'Email ou senha incorretos' };
    }
    
    localStorage.setItem('currentUser', email);
    localStorage.setItem('userId', email);
    localStorage.setItem('userName', user.name);
    
    showScreen('home');
    updateNavigation();
    loadBooksFromStorage();
    
    return { success: true, user };
  } catch (error) {
    console.error("Erro no login:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fazer logout
 */
function logoutUser() {
  try {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    showScreen('login');
    updateNavigation();
    return { success: true };
  } catch (error) {
    console.error("Erro no logout:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar autenticação
 */
function isUserAuthenticated() {
  return !!localStorage.getItem('currentUser');
}

// ========== FUNÇÕES DE LIVROS (localStorage) ==========

/**
 * Carregar livros do usuário
 */
function loadBooksFromStorage() {
  try {
    if (!isUserAuthenticated()) return [];
    
    const currentUser = localStorage.getItem('currentUser');
    const books = JSON.parse(localStorage.getItem(`books_${currentUser}`) || '[]');
    
    displayBooks(books);
    return books;
  } catch (error) {
    console.error("Erro ao carregar livros:", error.message);
    return [];
  }
}

/**
 * Adicionar novo livro
 */
function addNewBook(title, author, description, genre = '', pdfFile = null) {
  try {
    if (!isUserAuthenticated()) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    const currentUser = localStorage.getItem('currentUser');
    const books = JSON.parse(localStorage.getItem(`books_${currentUser}`) || '[]');
    
    const newBook = {
      id: Date.now().toString(),
      title,
      author,
      description,
      genre,
      createdAt: new Date().toISOString(),
      pdfFile: pdfFile ? pdfFile.name : '',
      cover: '📖'
    };
    
    books.push(newBook);
    localStorage.setItem(`books_${currentUser}`, JSON.stringify(books));
    
    loadBooksFromStorage();
    showScreen('home');
    
    return { success: true, bookId: newBook.id };
  } catch (error) {
    console.error("Erro ao adicionar livro:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Deletar livro
 */
function deleteBook(bookId) {
  try {
    if (!isUserAuthenticated()) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    const currentUser = localStorage.getItem('currentUser');
    let books = JSON.parse(localStorage.getItem(`books_${currentUser}`) || '[]');
    
    books = books.filter(b => b.id !== bookId);
    localStorage.setItem(`books_${currentUser}`, JSON.stringify(books));
    
    loadBooksFromStorage();
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar livro:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Exibir livros na grid
 */
function displayBooks(books) {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  if (books.length === 0) {
    grid.innerHTML = '<p class="text-muted">Nenhum livro adicionado ainda.</p>';
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
          <p class="card-text text-muted">por ${book.author}</p>
          <p class="card-text small">${book.genre}</p>
          <button class="btn btn-primary btn-sm w-100 mb-2" onclick="showReader('${book.id}')">Ler</button>
          <button class="btn btn-danger btn-sm w-100" onclick="deleteBook('${book.id}'); loadBooksFromStorage();">Deletar</button>
        </div>
      </div>
    `;
    grid.appendChild(bookCard);
  });
}

/**
 * Mostrar leitor de livro
 */
function showReader(bookId) {
  const currentUser = localStorage.getItem('currentUser');
  const books = JSON.parse(localStorage.getItem(`books_${currentUser}`) || '[]');
  const book = books.find(b => b.id === bookId);
  
  if (book) {
    const content = document.getElementById('readerContent');
    if (content) {
      content.innerHTML = `<h2>${book.title}</h2><p>${book.author}</p><p>${book.description}</p><p><em>Arquivo: ${book.pdfFile}</em></p>`;
    }
    showScreen('reader');
  }
}

/**
 * Atualizar navegação baseado em autenticação
 */
function updateNavigation() {
  const navButtons = document.getElementById('navButtons');
  if (!navButtons) return;
  
  if (isUserAuthenticated()) {
    const userName = localStorage.getItem('userName') || 'Usuário';
    navButtons.innerHTML = `
      <button class="btn btn-outline-secondary btn-sm" onclick="showScreen('profile')">👤 ${userName}</button>
      <button class="btn btn-outline-info btn-sm" onclick="showScreen('settings')">⚙️ Config</button>
      <button class="btn btn-outline-danger btn-sm" onclick="logoutUser()">Sair</button>
    `;
  }
}

// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', function() {
  // ===== INICIALIZAR CONVEX =====
  // Tentar obter URL do localStorage ou usar fallback
  const savedConvexUrl = localStorage.getItem('convexUrl');
  const convexUrlToUse = savedConvexUrl || CONVEX_URL;
  
  // Se ainda for o placeholder, pedir para configurar
  if (convexUrlToUse.includes('seu-projeto-id')) {
    console.warn('⚠️  URL do Convex não configurada! Configure em Settings ou edite o código.');
    // Ainda assim tentar inicializar com um aviso
    if (!initializeConvex(convexUrlToUse)) {
      console.error('❌ Não foi possível inicializar Convex. A integração com banco de dados pode não funcionar.');
    }
  } else {
    initializeConvex(convexUrlToUse);
  }
  
  // ===== CONFIGURAR FORMS =====
  
  // Configurar forms
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const result = loginUser(email, password);
      if (!result.success) {
        alert('Erro: ' + result.error);
      }
    });
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      const result = registerUser(email, password, name);
      if (!result.success) {
        alert('Erro: ' + result.error);
      }
    });
  }
  
  const addBookForm = document.getElementById('addBookForm');
  if (addBookForm) {
    addBookForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const title = document.getElementById('bookTitle').value;
      const author = document.getElementById('bookAuthor').value;
      const genre = document.getElementById('bookGenre').value;
      const description = document.getElementById('bookDescription').value;
      const pdfFile = document.getElementById('bookPDF').files[0];
      
      const result = addNewBook(title, author, description, genre, pdfFile);
      if (!result.success) {
        alert('Erro: ' + result.error);
      } else {
        addBookForm.reset();
      }
    });
  }
  
  const convexConfigForm = document.getElementById('convexConfigForm');
  if (convexConfigForm) {
    // Carregar URL salva no form
    const savedUrl = getConvexUrl();
    if (!savedUrl.includes('seu-projeto-id')) {
      document.getElementById('convexUrl').value = savedUrl;
    }
    
    convexConfigForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const url = document.getElementById('convexUrl').value.trim();
      
      if (!url) {
        alert('Por favor, insira a URL do Convex');
        return;
      }
      
      // Validar formato de URL
      if (!url.startsWith('https://') || !url.includes('.convex.cloud')) {
        alert('URL inválida. Deve ser no formato: https://seu-projeto.convex.cloud');
        return;
      }
      
      // Tentar configurar e reinicializar
      const success = setConvexUrl(url);
      if (success) {
        showConvexStatus('✅ Convex configurado com sucesso!', 'success');
        setTimeout(() => showScreen('home'), 1500);
      } else {
        showConvexStatus('❌ Erro ao configurar Convex. Verifique a URL.', 'danger');
      }
    });
  }
  
  // Mostrar tela de login se não autenticado
  if (!isUserAuthenticated()) {
    showScreen('login');
  } else {
    showScreen('home');
    loadBooksFromStorage();
    updateNavigation();
  }
});

/**
 * Mostrar status da configuração do Convex
 */
function showConvexStatus(message, type = 'info') {
  const statusDiv = document.getElementById('convexStatus');
  const statusText = document.getElementById('convexStatusText');
  if (statusDiv && statusText) {
    statusText.textContent = message;
    statusDiv.className = `alert alert-${type} mb-3`;
    statusDiv.style.display = 'block';
  }
}

/**
 * Atualizar livro
 */
async function updateBook(bookId, updates) {
  try {
    if (!isUserAuthenticated()) {
      throw new Error("Usuário não autenticado");
    }
    
    if (!isConvexReady()) {
      throw new Error("Convex não está inicializado. Configure a URL em Configurações.");
    }

    await convex.mutation(api.books.updateBook, {
      bookId,
      ...updates,
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar livro:", error.message);
    return { success: false, error: error.message };
  }
}

// ========== FUNÇÕES DE UPLOAD ==========

/**
 * Fazer upload de PDF
 */
async function uploadPDF(file) {
  try {
    if (!isUserAuthenticated()) {
      throw new Error("Usuário não autenticado");
    }
    
    if (!isConvexReady()) {
      throw new Error("Convex não está inicializado. Configure a URL em Configurações.");
    }

    // 1. Gerar URL de upload
    const uploadUrl = await convex.mutation(api.uploads.generateUploadUrl);

    // 2. Fazer o upload do arquivo
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload falhou: ${response.statusText}`);
    }

    const { storageId } = await response.json();

    // 3. Salvar metadados do arquivo
    const uploadId = await convex.mutation(api.uploads.saveUploadedFile, {
      storageId,
      fileName: file.name,
      mimeType: file.type,
    });

    return { success: true, storageId, uploadId };
  } catch (error) {
    console.error("Erro no upload:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obter URL para download do PDF
 */
async function getPdfUrl(storageId) {
  try {
    if (!isConvexReady()) {
      throw new Error("Convex não está inicializado.");
    }
    
    const url = await convex.query(api.uploads.getDownloadUrl, {
      storageId,
    });
    return url;
  } catch (error) {
    console.error("Erro ao obter URL:", error.message);
    return null;
  }
}

/**
 * Listar uploads do usuário
 */
async function getUserUploads() {
  try {
    if (!isUserAuthenticated()) {
      return [];
    }
    
    if (!isConvexReady()) {
      console.warn("Convex não está inicializado.");
      return [];
    }

    const uploads = await convex.query(api.uploads.getUserUploads);
    return uploads;
  } catch (error) {
    console.error("Erro ao listar uploads:", error.message);
    return [];
  }
}

/**
 * Deletar arquivo PDF
 */
async function deletePdf(uploadId) {
  try {
    if (!isUserAuthenticated()) {
      throw new Error("Usuário não autenticado");
    }
    
    if (!isConvexReady()) {
      throw new Error("Convex não está inicializado. Configure a URL em Configurações.");
    }

    await convex.mutation(api.uploads.deleteUpload, { uploadId });
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error.message);
    return { success: false, error: error.message };
  }
}

// ========== EXEMPLO DE USO ==========

/*
// Registrar usuário
const registerResult = await registerUser(
  "usuario@example.com",
  "senha123",
  "João Silva"
);

// Login
const loginResult = await loginUser("usuario@example.com", "senha123");

// Carregar livros
const books = await loadBooks();

// Fazer upload de PDF
const fileInput = document.getElementById("pdfInput");
const uploadResult = await uploadPDF(fileInput.files[0]);

// Adicionar livro com PDF
const addResult = await addNewBook(
  "1984",
  "George Orwell",
  "Um clássico da ficção científica",
  "",
  uploadResult.storageId
);

// Obter URL do PDF para leitura
const pdfUrl = await getPdfUrl(uploadResult.storageId);
window.open(pdfUrl, "_blank");

// Logout
await logoutUser();
*/
