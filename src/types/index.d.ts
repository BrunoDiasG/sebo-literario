// filepath: c:\Users\Bruno\Desktop\Univali\sebo-pwa\src\types\index.d.ts
interface Book {
    id: number;
    title: string;
    author: string;
    genre: string;
    description: string;
    pdfPath: string; // Path to the PDF file
    addedBy: string; // Email of the user who added the book
    addedAt: string; // ISO date string of when the book was added
}

interface User {
    id: number;
    name: string;
    email: string;
    password: string; // Hashed password for authentication
}

interface Database {
    addBook(book: Book): void;
    removeBook(bookId: number): void;
    getBooks(): Book[];
    addUser(user: User): void;
    removeUser(userId: number): void;
    getUsers(): User[];
}