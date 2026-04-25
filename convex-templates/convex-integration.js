// ========================================
// INTEGRAÇÃO CONVEX - SCRIPT.JS TEMPLATE
// ========================================
// 
// Este arquivo mostra como integrar Convex
// com seu código JavaScript existente

import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api";

// Inicializar cliente Convex
const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL);

// ========== FUNÇÕES DE AUTENTICAÇÃO ==========

/**
 * Registrar novo usuário
 */
async function registerUser(email, password, name) {
  try {
    const userId = await convex.mutation(api.auth.signUp, {
      email,
      password,
      name,
    });
    
    // Salvar ID do usuário no localStorage
    localStorage.setItem("userId", userId);
    
    return { success: true, userId };
  } catch (error) {
    console.error("Erro no registro:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fazer login
 */
async function loginUser(email, password) {
  try {
    const user = await convex.mutation(api.auth.signIn, {
      email,
      password,
    });
    
    // Salvar informações do usuário
    localStorage.setItem("userId", user.userId);
    localStorage.setItem("userName", user.name);
    localStorage.setItem("userEmail", user.email);
    
    return { success: true, user };
  } catch (error) {
    console.error("Erro no login:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fazer logout
 */
async function logoutUser() {
  try {
    // Limpar dados locais
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    
    // Opcional: chamar signOut do Convex
    // await convex.mutation(api.auth.signOut);
    
    return { success: true };
  } catch (error) {
    console.error("Erro no logout:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar se usuário está autenticado
 */
function isUserAuthenticated() {
  return !!localStorage.getItem("userId");
}

/**
 * Obter ID do usuário autenticado
 */
function getCurrentUserId() {
  return localStorage.getItem("userId");
}

// ========== FUNÇÕES DE LIVROS ==========

/**
 * Carregar todos os livros do usuário
 */
async function loadBooks() {
  try {
    if (!isUserAuthenticated()) {
      console.warn("Usuário não autenticado");
      return [];
    }

    const books = await convex.query(api.books.getBooks);
    return books;
  } catch (error) {
    console.error("Erro ao carregar livros:", error.message);
    return [];
  }
}

/**
 * Adicionar novo livro
 */
async function addNewBook(title, author, description, coverUrl = "", pdfStorageId = "") {
  try {
    if (!isUserAuthenticated()) {
      throw new Error("Usuário não autenticado");
    }

    const bookId = await convex.mutation(api.books.addBook, {
      title,
      author,
      description,
      coverUrl,
      pdfStorageId,
    });

    return { success: true, bookId };
  } catch (error) {
    console.error("Erro ao adicionar livro:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Deletar livro
 */
async function deleteBook(bookId) {
  try {
    if (!isUserAuthenticated()) {
      throw new Error("Usuário não autenticado");
    }

    await convex.mutation(api.books.removeBook, { bookId });
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar livro:", error.message);
    return { success: false, error: error.message };
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

// ========== EXPORTAR FUNÇÕES ==========

export {
  // Auth
  registerUser,
  loginUser,
  logoutUser,
  isUserAuthenticated,
  getCurrentUserId,
  // Books
  loadBooks,
  addNewBook,
  deleteBook,
  updateBook,
  // Uploads
  uploadPDF,
  getPdfUrl,
  getUserUploads,
  deletePdf,
  // Utilitários
  convex,
  api,
};
