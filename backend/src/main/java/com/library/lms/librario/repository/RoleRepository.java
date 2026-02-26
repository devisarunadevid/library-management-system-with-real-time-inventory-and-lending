package com.library.lms.librario.repository;

import com.library.lms.librario.entity.Role;
import com.library.lms.librario.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long>{
    boolean existsByRoleName(RoleName roleName);

    Optional<Role> findByRoleName(RoleName roleName);
}
