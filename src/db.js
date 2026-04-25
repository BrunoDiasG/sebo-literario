// filepath: c:\Users\Bruno\Desktop\Univali\sebo-pwa\src\db.js
class Database {
    constructor() {
        this.books = JSON.parse(localStorage.getItem('books')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }

    // Add a new book with PDF file path
    addBook(book) {
        this.books.push(book);
        this.saveBooks();
    }

    // Remove a book by ID
    removeBook(bookId) {
        this.books = this.books.filter(book => book.id !== bookId);
        this.saveBooks();
    }

    // Retrieve all books
    getBooks() {
        return this.books;
    }

    // Add a new user
    addUser(user) {
        this.users.push(user);
        this.saveUsers();
    }

    // Remove a user by ID
    removeUser(userId) {
        this.users = this.users.filter(user => user.id !== userId);
        this.saveUsers();
    }

    // Retrieve all users
    getUsers() {
        return this.users;
    }

    // Save books to localStorage
    saveBooks() {
        localStorage.setItem('books', JSON.stringify(this.books));
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }
}

// Exporting the Database class for use in other modules
export default new Database();