package com.library.lms.librario.controller;

import com.library.lms.librario.dto.MemberDTO;
import com.library.lms.librario.dto.MemberRequest;
import com.library.lms.librario.dto.MemberUpdateRequest;
import com.library.lms.librario.dto.MemberWithPlanDTO;
import com.library.lms.librario.entity.Member;
import com.library.lms.librario.service.MemberService;
import com.library.lms.librario.service.OverdueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    @Autowired
    private MemberService memberService;

    @Autowired
    private OverdueService overdueService;


    // ✅ Create Member with Plan Assignment
    @PostMapping
    public ResponseEntity<Member> createMember(@RequestBody MemberRequest request) {
        Member member = memberService.createMember(request);
        return ResponseEntity.ok(member);
    }

    // ✅ Update Member (basic info or plan change)
    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable Long id,
                                               @RequestBody MemberUpdateRequest request) {
        return ResponseEntity.ok(memberService.updateMember(id, request));
    }

    // ✅ Renew/Upgrade Membership Plan
    @PutMapping("/{id}/membership")
    public ResponseEntity<Member> updateMembership(
            @PathVariable Long id,
            @RequestParam Long planId) {
        return ResponseEntity.ok(memberService.updateMembership(id, planId));
    }

    // ✅ Delete Member
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok("Member deleted successfully");
    }

    // ✅ Get Member by ID
    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getMemberById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<MemberDTO> getMyProfile(@RequestParam String email) {
        MemberDTO dto = memberService.getMemberProfile(email);
        return ResponseEntity.ok(dto);
    }

    // ✅ Get All Members
    @GetMapping
    public ResponseEntity<List<MemberDTO>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }

    // Endpoint to get member profile by email (logged-in user)
    @GetMapping("/profile/{email}")
    public ResponseEntity<MemberDTO> getProfile(@PathVariable String email) {
        MemberDTO dto = memberService.getMemberProfile(email);
        return ResponseEntity.ok(dto);
    }
    @GetMapping("/{id}/overdue")
    public ResponseEntity<List<com.library.lms.librario.dto.OverdueDTO>> getMemberOverdue(@PathVariable Long id) {
        var list = overdueService.getOverdueForUser(id);
        var dto = list.stream().map(r -> {
            long days = 0;
            if (r.getDueDate() != null) {
                days = java.time.Duration.between(r.getDueDate(), java.time.LocalDateTime.now()).toDays();
                if (days < 0) days = 0;
            }
            return com.library.lms.librario.dto.OverdueDTO.from(r, days);
        }).toList();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/withPlans")
    public ResponseEntity<List<MemberWithPlanDTO>> getMembersWithPlans() {
        try {
            List<MemberWithPlanDTO> members = memberService.getMembersWithPlans();
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    // ✅ Get only Premium Members
    @GetMapping("/premium")
    public ResponseEntity<List<MemberWithPlanDTO>> getPremiumMembers() {
        try {
            List<MemberWithPlanDTO> premiumMembers = memberService.getPremiumMembers();
            if (premiumMembers.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            return ResponseEntity.ok(premiumMembers);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

}
