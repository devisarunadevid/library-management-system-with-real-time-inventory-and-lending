package com.library.lms.librario.repository;

import com.library.lms.librario.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    // Already present
    Optional<Member> findByUser_Id(Long userId);

    // 🔹 Always get the latest membership for a user (highest endDate)
    Optional<Member> findTopByUser_IdOrderByEndDateDesc(Long userId);

    // ✅ Fetch member along with its membership plan to avoid lazy loading issues
    @Query("SELECT m FROM Member m JOIN FETCH m.membershipPlan WHERE m.id = :id")
    Optional<Member> findByIdWithPlan(@Param("id") Long id);

    @Query("SELECT m FROM Member m JOIN FETCH m.membershipPlan")
    List<Member> findAllWithPlan();

    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.membershipPlan WHERE m.user.id = :userId")
    Optional<Member> findByUserIdWithPlan(@Param("userId") Long userId);
}
