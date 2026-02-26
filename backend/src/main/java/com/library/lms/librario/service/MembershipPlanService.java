package com.library.lms.librario.service;

import com.library.lms.librario.entity.MembershipPlan;
import com.library.lms.librario.model.User;

import java.math.BigDecimal;
import java.util.List;

public interface MembershipPlanService {
    MembershipPlan createPlan(MembershipPlan plan);
    MembershipPlan updatePlan(Long id, MembershipPlan plan);
    void deletePlan(Long id);
    List<MembershipPlan> getAllPlans();
    MembershipPlan getPlanById(Long id);

    // 🔹 Utility methods for BorrowService
    int getBorrowDuration(User user);                  // how many days a user can borrow
    int getRenewalDays(User user);                     // how many extra days renewal adds
    BigDecimal getFinePerDay(User user, BigDecimal defaultFine);// per-day fine if overdue
}
