package com.library.lms.librario.controller;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepo;

    public UserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // ✅ Get only MEMBER role users
    @GetMapping
    public List<User> getAllNonAdminUsers() {
        return userRepo.findAll().stream()
                .filter(u -> u.getRole().getRoleName().name().equals("MEMBER"))
                .toList();
    }

    // (optional) get one member by ID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
