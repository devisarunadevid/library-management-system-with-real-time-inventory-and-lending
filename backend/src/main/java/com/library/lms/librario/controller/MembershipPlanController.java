package com.library.lms.librario.controller;

import com.library.lms.librario.entity.MembershipPlan;
import com.library.lms.librario.service.MembershipPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership-plans")
public class MembershipPlanController {

    private final MembershipPlanService membershipPlanService;

    public MembershipPlanController(MembershipPlanService membershipPlanService) {
        this.membershipPlanService = membershipPlanService;
    }

    @PostMapping
    public ResponseEntity<MembershipPlan> createPlan(@RequestBody MembershipPlan plan) {
        return ResponseEntity.ok(membershipPlanService.createPlan(plan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MembershipPlan> updatePlan(@PathVariable Long id, @RequestBody MembershipPlan plan) {
        return ResponseEntity.ok(membershipPlanService.updatePlan(id, plan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        membershipPlanService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<MembershipPlan>> getAllPlans() {
        return ResponseEntity.ok(membershipPlanService.getAllPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembershipPlan> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(membershipPlanService.getPlanById(id));
    }
}
