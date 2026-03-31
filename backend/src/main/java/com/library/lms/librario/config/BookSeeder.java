package com.library.lms.librario.config;

import com.library.lms.librario.model.Book;
import com.library.lms.librario.repository.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class BookSeeder implements CommandLineRunner {

    private final BookRepository bookRepository;

    public BookSeeder(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    public void run(String... args) {
        if (bookRepository.count() > 0) {
            System.out.println("📚 Books already exist, skipping seeder.");
            return;
        }

        System.out.println("🌱 Seeding 69 books into the database...");

        List<Book> books = new ArrayList<>();

        // Add all 69 books from the SQL dump
        books.add(createBook("Introduction to Algorithms", "Thomas H. Cormen", "Computer Science", "MIT Press", 2009, "9780262033848", "A1", "https://m.media-amazon.com/images/I/61ZYxrQEpCL._SY425_.jpg"));
        books.add(createBook("Design Patterns", "Erich Gamma", "Software Engineering", "Addison-Wesley", 1994, "9780201633610", "A2", "https://m.media-amazon.com/images/I/71sjeQGh7VL._SY425_.jpg"));
        books.add(createBook("Harry Potter and the Chamber of Secrets", "J.K. Rowling", "Fantasy", "Bloomsbury", 1998, "9780439064873", "B1", "https://m.media-amazon.com/images/I/818umIdoruL._SY466_.jpg"));
        books.add(createBook("The Adventures of Tom Sawyer", "Mark Twain", "Fiction / Adventure", "American Publishing Company", 1876, "9780486400778", "B2", "https://m.media-amazon.com/images/I/81fozxlffiL._SY466_.jpg"));
        books.add(createBook("Barbie: Princess Charm School", "Random House", "Fiction", "Random House", 2011, "9780375865310", "C1", "https://m.media-amazon.com/images/I/71z0dmcRC3L._SY385_.jpg"));
        books.add(createBook("Alice in Wonderland", "Lewis Carroll", "Fantasy", "Macmillan", 1865, "9780141321073", "C2", "https://m.media-amazon.com/images/I/71m46zlV2iL._SY522_.jpg"));
        books.add(createBook("Matilda", "Roald Dahl", "Fantasy", "Penguin Group", 1988, "9780142410370", "D1", "https://m.media-amazon.com/images/I/81N9eGv-5ML._SY466_.jpg"));
        books.add(createBook("The Lion, the Witch and the Wardrobe", "C.S. Lewis", "Fantasy", "HarperCollins", 1950, "9780064471046", "D2", "https://m.media-amazon.com/images/I/51jqx81ji-L._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("Pride and Prejudice", "Jane Austen", "Romance", "Penguin", 1813, "9780141439518", "RO-J1", "https://m.media-amazon.com/images/I/51BIZl6wfAL._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("All the Light We Cannot See", "Anthony Doerr", "Historical Fiction", "Scribner", 2014, "9781476746586", "HF-K1", "https://m.media-amazon.com/images/I/81Jk-jl3JfL._SY466_.jpg"));
        books.add(createBook("Charlotte’s Web", "E.B. White", "Children", "Harper & Brothers", 1952, "9780064400559", "CH-N1", "https://m.media-amazon.com/images/I/51xJY2VxGTL._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("The 7 Habits of Highly Effective People", "Stephen Covey", "Self-Help", "Free Press", 1989, "9780743269513", "SH-M1", "https://m.media-amazon.com/images/I/51CFUA2N4OL._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("The Diary of a Young Girl", "Anne Frank", "Biography", "Contact Publishing", 1947, "9780553296983", "BIO-L1", "https://m.media-amazon.com/images/I/61c4oAPwHhL._SY466_.jpg"));
        books.add(createBook("Murder on the Orient Express", "Agatha Christie", "Mystery", "HarperCollins", 1934, "9780062693662", "MY-I1", "https://m.media-amazon.com/images/I/81wYgzAVDBL._SY466_.jpg"));
        books.add(createBook("The Hunger Games", "Suzanne Collins", "Young Adult", "Scholastic Press", 2008, "9780439023481", "YA-H1", "https://m.media-amazon.com/images/I/81zlHaEBHaS._SY466_.jpg"));
        books.add(createBook("Fahrenheit 451", "Ray Bradbury", "Sci-Fi", "Simon & Schuster", 1953, "9781451673319", "SF-G1", "https://m.media-amazon.com/images/I/41PSvqPz6dL._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("The Da Vinci Code", "Dan Brown", "Fiction", "Doubleday", 2003, "9780307474278", "FI-F1", "https://m.media-amazon.com/images/I/41Xh2DgrhvL._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("To Kill a Mockingbird", "Harper Lee", "Classics", "J.B. Lippincott & Co.", 1960, "9780060935467", "CL-E2", "https://m.media-amazon.com/images/I/81gepf1eMqL._SY522_.jpg"));
        books.add(createBook("Treasure Island", "Robert Louis Stevenson", "Adventure", "Penguin", 1883, "9780486275598", "AD-D1", "https://m.media-amazon.com/images/I/71x1q7s4YDL._SY466_.jpg"));
        books.add(createBook("The Count of Monte Cristo", "Alexandre Dumas", "Adventure", "Penguin", 1844, "9780140449266", "AD-D4", "https://m.media-amazon.com/images/I/91tL6qOIwML._SY425_.jpg"));
        books.add(createBook("Code Complete", "Steve McConnell", "Computer Science", "Microsoft Press", 2004, "9780735619678", "CS-A4", "https://m.media-amazon.com/images/I/61MYY5PRibL._SY385_.jpg"));
        books.add(createBook("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "Fantasy", "Bloomsbury", 1997, "9780590353427", "F-C1", "https://m.media-amazon.com/images/I/91pI+R+GE7L._SY466_.jpg"));
        books.add(createBook("Around the World in 80 Days", "Jules Verne", "Adventure", "Penguin", 1873, "9780486275599", "AD-D2", "https://m.media-amazon.com/images/I/71pVoONWpnL._SY466_.jpg"));
        books.add(createBook("1984", "George Orwell", "Classics", "Secker & Warburg", 1949, "9780451524935", "CL-E4", "https://m.media-amazon.com/images/I/61nScdOJ9kL._SY466_.jpg"));
        books.add(createBook("Angels & Demons", "Dan Brown", "Fiction", "Pocket Books", 2000, "9780743493468", "FI-F3", "https://m.media-amazon.com/images/I/41KEjq2S4hL._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("The Alchemist", "Paulo Coelho", "Fiction", "HarperOne", 1988, "9780061122415", "FI-F5", "https://m.media-amazon.com/images/I/617lxveUjYL._SY466_.jpg"));
        books.add(createBook("Insurgent", "Veronica Roth", "Young Adult", "HarperCollins", 2012, "9780062024046", "YA-H5", "https://m.media-amazon.com/images/I/81MwcFN2FbL._SY466_.jpg"));
        books.add(createBook("The Pragmatic Programmer", "Andrew Hunt", "Computer Science", "Addison-Wesley", 1999, "9780201616224", "CS-A3", "https://m.media-amazon.com/images/I/514YGMKlQCL._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("Domain-Driven Design", "Eric Evans", "Software Engineering", "Addison-Wesley", 2003, "9780321125217", "SE-B3", "https://m.media-amazon.com/images/I/81ykBjVaUjL._SY425_.jpg"));
        books.add(createBook("Eragon", "Christopher Paolini", "Fantasy", "Knopf", 2002, "9780375826689", "F-C8", "https://m.media-amazon.com/images/I/918oSs9qIqL._SY385_.jpg"));
        books.add(createBook("The Two Towers", "J.R.R. Tolkien", "Fantasy", "HarperCollins", 1954, "9780547928203", "F-C5", "https://m.media-amazon.com/images/I/81TIR8kkl6L._SY466_.jpg"));
        books.add(createBook("Moby Dick", "Herman Melville", "Adventure", "Harper & Brothers", 1851, "9781503280786", "AD-D3", "https://m.media-amazon.com/images/I/71DftAlWuLL._SY522_.jpg"));
        books.add(createBook("Journey to the Center of the Earth", "Jules Verne", "Adventure", "Penguin", 1864, "9780486411001", "AD-D5", "https://m.media-amazon.com/images/I/61Nw5ahObLL._SY466_.jpg"));
        books.add(createBook("Great Expectations", "Charles Dickens", "Classics", "Penguin", 1861, "9780141439563", "CL-E3", "https://m.media-amazon.com/images/I/61yItwrNwiL._SY466_.jpg"));
        books.add(createBook("The Kite Runner", "Khaled Hosseini", "Fiction", "Riverhead Books", 2003, "9781594631931", "FI-F5", "https://m.media-amazon.com/images/I/51bt7LtryoL._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("Ender's Game", "Orson Scott Card", "Sci-Fi", "Tor Books", 1985, "9780812550702", "SF-G3", "https://m.media-amazon.com/images/I/71RoGB0yKOL._SY466_.jpg"));
        books.add(createBook("Catching Fire", "Suzanne Collins", "Young Adult", "Scholastic Press", 2009, "9780439023498", "YA-H2", "https://m.media-amazon.com/images/I/518vJBtdLnS._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("Gone Girl", "Gillian Flynn", "Mystery", "Crown", 2012, "9780307588371", "MY-I3", "https://m.media-amazon.com/images/I/61Sx28fdUoL._SY522_.jpg"));
        books.add(createBook("The Girl with the Dragon Tattoo", "Stieg Larsson", "Mystery", "Knopf", 2005, "9780307454546", "MY-I2", "https://m.media-amazon.com/images/I/81Erb9f5ljL._SY466_.jpg"));
        books.add(createBook("The Notebook", "Nicholas Sparks", "Romance", "Warner Books", 1996, "9780446605236", "RO-J2", "https://m.media-amazon.com/images/I/81QuSsdtynL._SY466_.jpg"));
        books.add(createBook("Wolf Hall", "Hilary Mantel", "Historical Fiction", "Fourth Estate", 2009, "9780312429980", "HF-K3", "https://m.media-amazon.com/images/I/51ulIL3ro3L._SY445_SX342_FMwebp_.jpg"));
        books.add(createBook("The Cat in the Hat", "Dr. Seuss", "Children", "Random House", 1957, "9780394800011", "CH-N7", "https://m.media-amazon.com/images/I/81sE-fprQ2L._SY425_.jpg"));
        books.add(createBook("Winnie-the-Pooh", "A.A. Milne", "Children", "Methuen", 1926, "9780525444435", "CH-N9", "https://m.media-amazon.com/images/I/61+sBzVZIPL._SY425_.jpg"));
        books.add(createBook("Goodnight Moon", "Margaret Wise Brown", "Children", "Harper & Brothers", 1947, "9780064430174", "CH-N8", "https://m.media-amazon.com/images/I/81eS2eHuu6L._SY342_.jpg"));
        books.add(createBook("Becoming", "Michelle Obama", "Biography", "Crown Publishing", 2018, "9781524763138", "BIO-L4", "https://m.media-amazon.com/images/I/819YLKVUOhL._SY466_.jpg"));
        books.add(createBook("Long Walk to Freedom", "Nelson Mandela", "Biography", "Little, Brown", 1994, "9780316548182", "BIO-L2", "https://m.media-amazon.com/images/I/91jMa+ndqrL._SY466_.jpg"));
        books.add(createBook("A Tale of Two Cities", "Charles Dickens", "Historical Fiction", "Penguin", 1859, "9780486417769", "HF-K5", "https://m.media-amazon.com/images/I/81tk0dOvfML._SY466_.jpg"));
        books.add(createBook("Clean Code", "Robert C. Martin", "Computer Science", "Prentice Hall", 2008, "9780132350884", "CS-A2", "https://m.media-amazon.com/images/I/71T7aD3EOTL._SY425_.jpg"));
        books.add(createBook("Continuous Delivery", "Jez Humble", "Software Engineering", "Addison-Wesley", 2010, "9780321601919", "SE-B4", "https://m.media-amazon.com/images/I/61URM5B90LL._SY425_.jpg"));
        books.add(createBook("The Fellowship of the Ring", "J.R.R. Tolkien", "Fantasy", "HarperCollins", 1954, "9780547928210", "F-C4", "https://m.media-amazon.com/images/I/813UBZ-O8sL._SY466_.jpg"));
        books.add(createBook("Inferno", "Dan Brown", "Fiction", "Doubleday", 2013, "9781400079155", "FI-F4", "https://m.media-amazon.com/images/I/81Kjb+TgdSL._SY466_.jpg"));
        books.add(createBook("Dune", "Frank Herbert", "Sci-Fi", "Ace", 1965, "9780441013593", "SF-G2", "https://m.media-amazon.com/images/I/81Ua99CURsL._SY522_.jpg"));
        books.add(createBook("Ready Player One", "Ernest Cline", "Sci-Fi", "Crown Publishing", 2011, "9780307887443", "SF-G7", "https://m.media-amazon.com/images/I/91Be3OR3f8L._SY466_.jpg"));
        books.add(createBook("Green Eggs and Ham", "Dr. Seuss", "Children", "Random House", 1960, "9780394800165", "CH-N3", "https://m.media-amazon.com/images/I/81G5xIVZj1L._SY425_.jpg"));
        books.add(createBook("Romeo and Juliet", "William Shakespeare", "Tragedy", "Penguin Classics", 1597, "9780141396477", "CL-E5", "https://m.media-amazon.com/images/I/81wg5gOTHAL._SY466_.jpg"));
        books.add(createBook("Hamlet", "William Shakespeare", "Tragedy", "Penguin Classics", 1603, "9780141396507", "CL-E6", "https://m.media-amazon.com/images/I/91tyEKO5gpL._SY466_.jpg"));
        books.add(createBook("Twelfth Night", "William Shakespeare", "Comedy", "Penguin Classics", 1623, "9780141396446", "CL-E7", "https://m.media-amazon.com/images/I/51egQSdt-mL._SY466_.jpg"));
        books.add(createBook("The Tempest", "William Shakespeare", "Comedy", "Penguin Classics", 1611, "9780141396279", "CL-E8", "https://m.media-amazon.com/images/I/81dBBHoJaEL._SY522_.jpg"));
        books.add(createBook("Julius Caesar", "William Shakespeare", "Historical/Tragedy", "Penguin Classics", 1599, "9780141396538", "CL-E9", "https://m.media-amazon.com/images/I/61roQjRk5fL._SY466_.jpg"));
        books.add(createBook("Macbeth", "William Shakespeare", "Tragedy", "Penguin Classics", 1606, "9780141396316", "CL-E10", "https://m.media-amazon.com/images/I/71MtzQ1WtmL._SY522_.jpg"));

        bookRepository.saveAll(books);
        System.out.println("✅ Data Seeding Completed!");
    }

    private Book createBook(String title, String author, String genre, String publisher, int year, String isbn, String shelf, String imageUrl) {
        return Book.builder()
                .title(title)
                .author(author)
                .genre(genre)
                .publisher(publisher)
                .year(year)
                .isbn(isbn)
                .shelf(shelf)
                .imageUrl(imageUrl)
                .totalCopies(10) // ✅ Default 10 for testing
                .availableCopies(10) // ✅ Default 10 for testing
                .build();
    }
}
