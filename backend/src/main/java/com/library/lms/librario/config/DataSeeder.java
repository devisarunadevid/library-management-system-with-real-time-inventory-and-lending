package com.library.lms.librario.config;

import com.library.lms.librario.entity.MembershipPlan;
import com.library.lms.librario.entity.Role;
import com.library.lms.librario.entity.RoleName;
import com.library.lms.librario.repository.MembershipPlanRepository;
import com.library.lms.librario.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final MembershipPlanRepository planRepository;

    public DataSeeder(RoleRepository roleRepository, MembershipPlanRepository planRepository) {
        this.roleRepository = roleRepository;
        this.planRepository = planRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🌱 Starting Data Seeding...");

        // 1. Seed Roles
        for (RoleName rn : RoleName.values()) {
            if (!roleRepository.existsByRoleName(rn)) {
                System.out.println("Saving role: " + rn);
                roleRepository.save(new Role(null, rn));
            }
        }

        // 2. Seed default Membership Plan if none exists
        if (planRepository.count() == 0) {
            System.out.println("Saving default 'Basic' membership plan...");
            MembershipPlan basicPlan = new MembershipPlan();
            basicPlan.setType("Basic");
            basicPlan.setFees(BigDecimal.ZERO);
            basicPlan.setDurationMonths(12);
            basicPlan.setBorrowingLimit(5);
            basicPlan.setBorrowDurationDays(14);
            basicPlan.setRenewalDays(7);
            basicPlan.setFinePerDay(new BigDecimal("1.0"));
            planRepository.save(basicPlan);
            
            System.out.println("Saving default 'Premium' membership plan...");
            MembershipPlan premiumPlan = new MembershipPlan();
            premiumPlan.setType("Premium");
            premiumPlan.setFees(new BigDecimal("10.0"));
            premiumPlan.setDurationMonths(12);
            premiumPlan.setBorrowingLimit(15);
            premiumPlan.setBorrowDurationDays(30);
            premiumPlan.setRenewalDays(14);
            premiumPlan.setFinePerDay(new BigDecimal("0.5"));
            planRepository.save(premiumPlan);
        }

        System.out.println("✅ Data Seeding Completed!");
    }
}
