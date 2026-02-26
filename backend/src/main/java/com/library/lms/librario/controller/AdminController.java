package com.library.lms.librario.controller;

import com.library.lms.librario.entity.BorrowRequest;
import com.library.lms.librario.entity.MembershipRequest;
import com.library.lms.librario.entity.RoleName;
import com.library.lms.librario.entity.enums.RequestStatus;
import com.library.lms.librario.model.User;
import com.library.lms.librario.entity.Role;
import com.library.lms.librario.repository.BorrowRequestRepository;
import com.library.lms.librario.repository.MembershipRequestRepository;
import com.library.lms.librario.repository.RoleRepository;
import com.library.lms.librario.repository.UserRepository;
import com.library.lms.librario.service.mail.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.expression.spel.ast.Assign;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private RoleRepository roleRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private MailService mailService;
    @Autowired
    private BorrowRequestRepository borrowRequestRepo;
    @Autowired
    private MembershipRequestRepository membershipRequestRepo;

    // Add Librarian (ADMIN only)
    @PostMapping("/add-librarian")
    public ResponseEntity<?> addLibrarian(@RequestHeader("token") String token, @RequestBody User user) {
        if (userRepo.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        // 1) keep raw password before encoding
        String rawPassword = user.getPassword();

        // 2) encode password and set on entity (store only encoded in DB)
        user.setPassword(passwordEncoder.encode(rawPassword));

        // 2️⃣ Fetch LIBRARIAN role
        Role librarianRole = roleRepo.findByRoleName(RoleName.LIBRARIAN)
                .orElseThrow(() -> new RuntimeException("Role LIBRARIAN not found in DB"));

        // 3️⃣ Assign role to user
        user.setRole(librarianRole);

        // Save new librarian
        userRepo.save(user);
        // 5) send credentials email (don't fail the whole request if email sending fails)
        try {
            String recipient = user.getEmail();
            String subject = "Your Librarian Account Credentials - Librario";
            String body = "Hello " + (user.getName() == null ? "" : user.getName()) + ",\n\n"
                    + "Your Librarian account has been created.\n\n"
                    + "Email: " + user.getEmail() + "\n"
                    + "Password: " + rawPassword + "\n\n"
                    + "Please login and change your password immediately.\n\n"
                    + "Regards,\nLibrario Team";

            // Use existing MailService send(...) which you already have
            mailService.send(recipient, subject, body);
            // alternatively you can call mailService.sendCredentialsEmail(recipient, rawPassword);
        } catch (Exception e) {
            // log the error and return partial success (librarian added but email failed)
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                    "message", "Librarian added, but failed to send email",
                    "emailError", e.getMessage()
            ));
        }

        return ResponseEntity.ok(Map.of("message", "Librarian added successfully and email sent"));
    }

    // ✅ Get all librarians
    @GetMapping("/librarians")
    public ResponseEntity<?> getAllLibrarians() {
        List<User> librarians = userRepo.findAll()
                .stream()
                .filter(u -> u.getRole().getRoleName() == RoleName.LIBRARIAN)
                .toList();
        return ResponseEntity.ok(librarians);
    }

    // ✅ Update librarian
    @PutMapping("/librarians/{id}")
    public ResponseEntity<?> updateLibrarian(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepo.findById(id)
                .map(user -> {
                    user.setName(updatedUser.getName());
                    user.setEmail(updatedUser.getEmail());
                    if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
                        user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                    }
                    userRepo.save(user);
                    return ResponseEntity.ok(Map.of("message", "Librarian updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }


    // --- NEW: Get all pending borrow requests ---
    @GetMapping("/borrow-requests")
    public List<BorrowRequest> getPendingBorrowRequests() {
        return borrowRequestRepo.findByStatus(RequestStatus.PENDING);
    }

    // --- NEW: Get all pending membership requests ---
    @GetMapping("/membership-requests")
    public List<MembershipRequest> getPendingMembershipRequests() {
        return membershipRequestRepo.findByStatus(RequestStatus.PENDING);
    }


}