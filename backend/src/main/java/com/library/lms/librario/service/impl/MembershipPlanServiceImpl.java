package com.library.lms.librario.service.impl;

import com.library.lms.librario.entity.MembershipPlan;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.MembershipPlanRepository;
import com.library.lms.librario.service.MembershipPlanService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MembershipPlanServiceImpl implements MembershipPlanService {

    private final MembershipPlanRepository membershipPlanRepository;

    public MembershipPlanServiceImpl(MembershipPlanRepository membershipPlanRepository) {
        this.membershipPlanRepository = membershipPlanRepository;
    }

    @Override
    public MembershipPlan createPlan(MembershipPlan plan) {
        return membershipPlanRepository.save(plan);
    }

    @Override
    public MembershipPlan updatePlan(Long id, MembershipPlan plan) {
        return membershipPlanRepository.findById(id)
                .map(existing -> {
                    existing.setType(plan.getType());
                    existing.setFees(plan.getFees());
                    existing.setDurationMonths(plan.getDurationMonths());
                    existing.setBorrowingLimit(plan.getBorrowingLimit());

                    // ✅ new fields
                    existing.setBorrowDurationDays(plan.getBorrowDurationDays());
                    existing.setRenewalDays(plan.getRenewalDays());
                    existing.setFinePerDay(plan.getFinePerDay());

                    return membershipPlanRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Plan not found with id " + id));
    }

    @Override
    public void deletePlan(Long id) {
        membershipPlanRepository.deleteById(id);
    }

    @Override
    public List<MembershipPlan> getAllPlans() {
        return membershipPlanRepository.findAll();
    }

    @Override
    public MembershipPlan getPlanById(Long id) {
        return membershipPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id " + id));
    }

    @Override
    public int getBorrowDuration(User user) {
        MembershipPlan plan = user.getMembershipPlan();
        if (plan == null) {
            throw new RuntimeException("User has no membership plan assigned");
        }
        return plan.getBorrowDurationDays();
    }

    @Override
    public int getRenewalDays(User user) {
        MembershipPlan plan = user.getMembershipPlan();
        if (plan == null) {
            throw new RuntimeException("User has no membership plan assigned");
        }
        return plan.getRenewalDays();
    }

    @Override
    public BigDecimal getFinePerDay(User user, BigDecimal defaultFine) {
        MembershipPlan plan = user.getMembershipPlan();
        return plan != null && plan.getFinePerDay() != null ? plan.getFinePerDay() : defaultFine;
    }

}
