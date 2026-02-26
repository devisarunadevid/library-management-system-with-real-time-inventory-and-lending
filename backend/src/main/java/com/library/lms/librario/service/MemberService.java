package com.library.lms.librario.service;

import com.library.lms.librario.dto.MemberDTO;
import com.library.lms.librario.dto.MemberRequest;
import com.library.lms.librario.dto.MemberUpdateRequest;
import com.library.lms.librario.dto.MemberWithPlanDTO;
import com.library.lms.librario.entity.Member;
import com.library.lms.librario.model.User;

import java.util.List;

public interface MemberService {
    Member createMember(MemberRequest request);
    Member updateMember(Long id, MemberUpdateRequest request);
    void deleteMember(Long id);
    Member getMemberById(Long id);
    List<MemberDTO> getAllMembers();
    Member updateMembership(Long memberId, Long planId);
    MemberDTO getMemberProfile(String email);
    Member getMemberByEmail(String email);

    // ✅ Add a helper method here but **do not implement it in interface with repository**
    Member getMemberByUser(User user);
    List<MemberWithPlanDTO> getMembersWithPlans();
    List<MemberWithPlanDTO> getPremiumMembers();

}
