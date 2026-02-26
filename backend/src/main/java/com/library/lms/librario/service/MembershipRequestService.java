package com.library.lms.librario.service;

import com.library.lms.librario.entity.MembershipRequest;
import com.library.lms.librario.entity.MembershipPlan;
import com.library.lms.librario.model.User;
import com.library.lms.librario.entity.enums.RequestStatus;
import com.library.lms.librario.repository.MembershipRequestRepository;
import com.library.lms.librario.repository.MembershipPlanRepository;
import com.library.lms.librario.repository.UserRepository;
import com.library.lms.librario.service.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MembershipRequestService {

    private final MembershipRequestRepository requestRepo;
    private final UserRepository userRepo;
    private final MembershipPlanRepository planRepo;
    private final MailService mailService;
    private final NotificationService notificationService;

    // 1️⃣ Member requests a plan
    @Transactional
    public MembershipRequest requestPlan(Long userId, Long planId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        MembershipPlan plan = planRepo.findById(planId).orElseThrow(() -> new RuntimeException("Plan not found"));

        MembershipRequest req = MembershipRequest.builder()
                .user(user)
                .plan(plan)
                .paid(false)
                .status(RequestStatus.PENDING)
                .requestDate(LocalDateTime.now())
                .build();
        MembershipRequest saved = requestRepo.save(req);

        // ✅ Email to user
        String subject = "Membership Request Submitted";
        String body = "<div style='font-family:Arial,sans-serif;color:#333;'>" +
                "<h2 style='color:#2E86C1;'>📋 Membership Request Submitted</h2>" +
                "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                "<p>We have received your membership request for the plan <b>" + plan.getType() + "</b>.</p>" +
                "<p>Your request is currently <span style='color:orange;font-weight:bold;'>PENDING</span>.</p>" +
                "<p>We will notify you once it is approved or rejected.</p>" +
                "<p><b>Request ID:</b> " + saved.getId() + "</p>" +
                "<br><p>Regards,<br/>Library Team</p></div>";

        mailService.send(user.getEmail(), subject, body);

        // ✅ Notify Admin via email
        mailService.send("admin@library.com", "New Membership Request",
                "User <b>" + user.getName() + "</b> has requested plan: <b>" + plan.getType() + "</b>.");

        // ✅ In-app notifications
        notificationService.createForMember(user.getId(), "Your membership request has been submitted.");
        notificationService.createForAdmin("New membership request submitted by " + user.getName());

        return saved;
    }

    // 2️⃣ Admin approves request
    @Transactional
    public MembershipRequest approveRequest(Long requestId) {
        MembershipRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request already processed");
        }

        req.setStatus(RequestStatus.APPROVED);
        req.setApprovedDate(LocalDateTime.now());
        requestRepo.save(req);

        // ✅ Email to user
        String subject = "Membership Request Approved";
        String body = "<h3>Your membership request for <b>" + req.getPlan().getType() +
                "</b> has been approved.</h3>" +
                "<p>Please proceed with payment.</p>";
        mailService.send(req.getUser().getEmail(), subject, body);

        // ✅ Notifications
        notificationService.createForMember(req.getUser().getId(),
                "Your membership request was approved. Please proceed with payment.");
        notificationService.createForAdmin("Membership request approved for " + req.getUser().getName());

        return req;
    }

    // 3️⃣ Admin rejects request
    @Transactional
    public MembershipRequest rejectRequest(Long requestId, String reason) {
        MembershipRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request already processed");
        }

        req.setStatus(RequestStatus.REJECTED);
        requestRepo.save(req);

        // ✅ Email to user
        String subject = "Membership Request Rejected";
        String body = "<div style='font-family:Arial,sans-serif;color:#333;'>" +
                "<h2 style='color:#C0392B;'>❌ Membership Request Rejected</h2>" +
                "<p>Hi <b>" + req.getUser().getName() + "</b>,</p>" +
                "<p>Your membership request for the plan <b>" + req.getPlan().getType() + "</b> has been " +
                "<span style='color:red;font-weight:bold;'>REJECTED</span>.</p>" +
                "<p>Reason: " + reason + "</p>" +
                "<p>Please contact the library for more details.</p>" +
                "<br><p>Regards,<br/>Library Team</p></div>";

        mailService.send(req.getUser().getEmail(), subject, body);

        // ✅ Notification
        notificationService.createForMember(req.getUser().getId(),
                "Your membership request was rejected. Reason: " + reason);

        return req;
    }

    // 4️⃣ List pending requests
    public List<MembershipRequest> getPendingRequests() {
        return requestRepo.findByStatus(RequestStatus.PENDING);
    }

    // 5️⃣ List requests by user
    public List<MembershipRequest> getUserRequests(Long userId) {
        userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepo.findByUserId(userId);
    }

    // 6️⃣ List all membership requests (Admin dashboard)
    public List<MembershipRequest> getAllRequests() {
        return requestRepo.findAll();
    }

    // 6️⃣ Get approved but unpaid requests (for librarian offline payment form)
    public List<MembershipRequest> getApprovedUnpaidRequests() {
        return requestRepo.findByStatus(RequestStatus.APPROVED);
    }

    // 7️⃣ Mark request as PAID
    @Transactional
    public MembershipRequest markAsPaid(Long requestId) {
        MembershipRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (req.isPaid()) {
            return req; // already paid
        }

        req.setPaid(true);
        req.setStatus(RequestStatus.COMPLETED);

        // set user's active membership plan
        if (req.getPlan() != null) {
            req.getUser().setMembershipPlan(req.getPlan());
            userRepo.save(req.getUser());
        }

        requestRepo.save(req);

        // ✅ Notify via email
        mailService.send(req.getUser().getEmail(), "Membership Activated",
                "Your membership plan " + req.getPlan().getType() + " is now active.");

        // ✅ Notifications
        notificationService.createForMember(req.getUser().getId(),
                "Your membership is now active for plan: " + req.getPlan().getType());
        notificationService.createForAdmin("Membership activated for " + req.getUser().getName());

        return req;
    }
}
