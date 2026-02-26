package com.library.lms.librario.service.impl;

import com.library.lms.librario.dto.MemberDTO;
import com.library.lms.librario.dto.MemberRequest;
import com.library.lms.librario.dto.MemberUpdateRequest;
import com.library.lms.librario.dto.MemberWithPlanDTO;
import com.library.lms.librario.entity.Member;
import com.library.lms.librario.entity.MembershipPlan;
import com.library.lms.librario.entity.enums.MemberStatus;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.MemberRepository;
import com.library.lms.librario.repository.MembershipPlanRepository;
import com.library.lms.librario.repository.UserRepository;
import com.library.lms.librario.service.MemberService;
import com.library.lms.librario.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;

@Service
public class MemberServiceImpl implements MemberService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    // ✅ Create new member with User + Plan
    @Override
    public Member createMember(MemberRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MembershipPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        Member member = new Member();
        LocalDate startDate = LocalDate.parse(request.getStartDate());
        member.setUser(user);
        member.setMembershipPlan(plan);
        member.setStartDate(startDate);

        // set end date based on plan
        if (plan.getDurationMonths() > 0) {
            member.setEndDate(startDate.plusMonths(plan.getDurationMonths()));
        } else if (plan.getDurationDays() > 0) {
            member.setEndDate(startDate.plusDays(plan.getDurationDays()));
        } else {
            member.setEndDate(startDate);
        }

        member.setStatus(MemberStatus.ACTIVE);
        return memberRepository.save(member);
    }

    // ✅ Update existing member info + plan
    @Override
    public Member updateMember(Long id, MemberUpdateRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + id));

        // update the underlying user details
        if (request.getName() != null) member.getUser().setName(request.getName());
        if (request.getEmail() != null) member.getUser().setEmail(request.getEmail());

        // update plan if provided
        if (request.getPlanId() != null) {
            MembershipPlan plan = planRepository.findById(request.getPlanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id " + request.getPlanId()));
            member.setMembershipPlan(plan);

            LocalDate startDate = LocalDate.now();
            member.setStartDate(startDate);

            if (plan.getDurationMonths() > 0) {
                member.setEndDate(startDate.plusMonths(plan.getDurationMonths()));
            } else if (plan.getDurationDays() > 0) {
                member.setEndDate(startDate.plusDays(plan.getDurationDays()));
            }
        }

        return memberRepository.save(member);
    }

    @Override
    public Member updateMembership(Long memberId, Long planId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusMonths(plan.getDurationMonths());

        member.setMembershipPlan(plan);
        member.setStartDate(startDate);
        member.setEndDate(endDate);

        return memberRepository.save(member);
    }

    @Override
    public void deleteMember(Long id) {
        if (!memberRepository.existsById(id)) {
            throw new ResourceNotFoundException("Member not found with id " + id);
        }
        memberRepository.deleteById(id);
    }

    @Override
    public Member getMemberById(Long id) {
        return memberRepository.findByIdWithPlan(id) // use JOIN FETCH query
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + id));
    }

    @Override
    public Member getMemberByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return memberRepository.findByUserIdWithPlan(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
    }

    // ✅ Mapper method
    private MemberDTO mapToDTO(Member member) {
        MemberDTO dto = new MemberDTO();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setUserEmail(member.getUser().getEmail());
        dto.setUserName(member.getUser().getName());

        if (member.getMembershipPlan() != null) {
            dto.setPlanId(member.getMembershipPlan().getId());
            dto.setPlanType(member.getMembershipPlan().getType());
            dto.setBorrowingLimit(member.getMembershipPlan().getBorrowingLimit());
        } else {
            dto.setPlanType("No Plan");
            dto.setBorrowingLimit(0);
        }

        dto.setStartDate(member.getStartDate());
        dto.setEndDate(member.getEndDate());
        dto.setStatus(member.getStatus().name());
        return dto;
    }

    @Override
    public List<MemberDTO> getAllMembers() {
        return memberRepository.findAllWithPlan()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public MemberDTO getMemberProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Member member = memberRepository.findByUserIdWithPlan(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        return mapToDTO(member);
    }

    @Override
    public Member getMemberByUser(User user) {
        return memberRepository.findByUserIdWithPlan(user.getId())
                .orElseThrow(() -> new RuntimeException("Member not found for user " + user.getEmail()));
    }

    @Override
    public List<MemberWithPlanDTO> getMembersWithPlans() {
        String sql = """
        SELECT m.id, m.user_id AS userId, u.name AS userName, u.email AS userEmail,
               mp.type AS planType, mp.fees, mp.borrowing_limit
        FROM members m
        JOIN membership_plans mp ON m.membership_plan_id = mp.id
        JOIN users u ON m.user_id = u.id
        WHERE m.status = 'ACTIVE'
    """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            MemberWithPlanDTO dto = new MemberWithPlanDTO();
            dto.setId(rs.getLong("id"));
            dto.setUserId(rs.getLong("userId"));
            dto.setUserName(rs.getString("userName"));
            dto.setUserEmail(rs.getString("userEmail"));
            dto.setPlanType(rs.getString("planType"));
            dto.setFees(rs.getDouble("fees"));
            dto.setBorrowingLimit(rs.getInt("borrowing_limit"));
            return dto;
        });
    }

    @Override
    public List<MemberWithPlanDTO> getPremiumMembers() {
        String sql = """
        SELECT m.id, m.user_id AS userId, u.name AS userName, u.email AS userEmail,
               mp.type AS planType, mp.fees, mp.borrowing_limit
        FROM members m
        JOIN membership_plans mp ON m.membership_plan_id = mp.id
        JOIN users u ON m.user_id = u.id
        WHERE m.status = 'ACTIVE' AND LOWER(mp.type) = 'premium'
    """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            MemberWithPlanDTO dto = new MemberWithPlanDTO();
            dto.setId(rs.getLong("id"));
            dto.setUserId(rs.getLong("userId"));
            dto.setUserName(rs.getString("userName"));
            dto.setUserEmail(rs.getString("userEmail"));
            dto.setPlanType(rs.getString("planType"));
            dto.setFees(rs.getDouble("fees"));
            dto.setBorrowingLimit(rs.getInt("borrowing_limit"));
            return dto;
        });
    }

}
