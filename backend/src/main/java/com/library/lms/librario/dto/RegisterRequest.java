package com.library.lms.librario.dto;


import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    // Optional: allow admin to create librarians later
    private String role; // "MEMBER" (default), or "LIBRARIAN" when admin creates
}
