package com.library.lms.librario.service;

import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class CustomUserDetailsService implements UserDetailsService{
    @Autowired
    private UserRepository userRepo;

    // We will use "email" as the username for login
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User u = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // Convert Role (ADMIN/LIBRARIAN/MEMBER) -> Spring authority "ROLE_ADMIN" etc.
        GrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + u.getRole().getRoleName().name());

        return new org.springframework.security.core.userdetails.User(
                u.getEmail(),
                u.getPassword(),
                true,  // enabled (always true for now)
                true,                   // accountNonExpired
                true,                   // credentialsNonExpired
                true,                   // accountNonLocked
                List.of(authority)
        );
    }
}
