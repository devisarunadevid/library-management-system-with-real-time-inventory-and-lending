package com.library.lms.librario.controller;

import com.library.lms.librario.dto.OfflineFinePaymentRequest;
import com.library.lms.librario.dto.OfflineMembershipPaymentRequest;
import com.library.lms.librario.dto.OfflinePaymentDTO;
import com.library.lms.librario.entity.*;
import com.library.lms.librario.entity.enums.MemberStatus;
import com.library.lms.librario.entity.enums.RequestStatus;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.BorrowRecordRepository;
import com.library.lms.librario.repository.MemberRepository;
import com.library.lms.librario.repository.PaymentRepository;
import com.library.lms.librario.repository.MembershipRequestRepository;
import com.library.lms.librario.service.PaymentService;
import com.library.lms.librario.service.mail.MailService;
import com.library.lms.librario.service.NotificationService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173") // adjust to your front-end origin
public class PaymentController {

    private final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepo;
    private final MembershipRequestRepository requestRepo;
    private final MailService mailService;
    private final NotificationService notificationService;
    private final MemberRepository memberRepository;
    private final BorrowRecordRepository borrowRecordRepo;
    private final PaymentService paymentService;


    @Value("${razorpay.key_id}")     private String keyId;
    @Value("${razorpay.key_secret}") private String keySecret;

    public PaymentController(@Value("${razorpay.key_id}") String keyId,
                             @Value("${razorpay.key_secret}") String keySecret,
                             PaymentRepository paymentRepo,
                             MembershipRequestRepository requestRepo,
                             MemberRepository memberRepository,
                             BorrowRecordRepository borrowRecordRepo,
                             MailService mailService,
                             NotificationService notificationService,
                             PaymentService paymentService) throws Exception {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
        this.paymentRepo = paymentRepo;
        this.requestRepo = requestRepo;
        this.memberRepository = memberRepository;
        this.borrowRecordRepo = borrowRecordRepo;
        this.mailService = mailService;
        this.notificationService = notificationService;
        this.paymentService = paymentService;
    }

    @PostMapping("/order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        log.info("POST /api/payments/order payload: {}", data);
        try {
            Long userId = data.containsKey("userId") ? Long.valueOf(data.get("userId").toString()) : null;
            Long membershipRequestId = data.containsKey("membershipRequestId") ? Long.valueOf(data.get("membershipRequestId").toString()) : null;
            if (userId == null || membershipRequestId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId and membershipRequestId are required"));
            }

            double amountInRupees = Double.parseDouble(data.get("amount").toString()); // rupees
            int amountInPaise = (int) Math.round(amountInRupees * 100);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("payment_capture", 1);

            Order order = razorpayClient.Orders.create(orderRequest);
            String orderId = order.get("id").toString();
            log.info("Razorpay order created: {}", orderId);

            // 🔹 Load MembershipRequest & User so we can store member name/email in Payment row
            MembershipRequest req = requestRepo.findById(membershipRequestId)
                    .orElseThrow(() -> new RuntimeException("Membership Request not found for id: " + membershipRequestId));

            User user = req.getUser();

            Payment payment = Payment.builder()
                    .userId(userId)
                    .membershipRequestId(membershipRequestId)
                    .amount(BigDecimal.valueOf(amountInRupees))
                    .currency("INR")
                    .status(PaymentStatus.INITIATED)
                    .orderId(orderId)
                    // ✅ fill these so payments table has info even before success
                    .type(PaymentType.ONLINE)
                    .memberName(user != null ? user.getName() : null)
                    .memberEmail(user != null ? user.getEmail() : null)
                    .build();

            paymentRepo.save(payment);
            log.info("Saved Payment row id={} orderId={}", payment.getId(), orderId);

            return ResponseEntity.ok(Map.of(
                    "orderId", orderId,
                    "currency", order.get("currency"),
                    "amount", amountInPaise,
                    "key", keyId
            ));
        } catch (Exception e) {
            log.error("Error in createOrder", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/success")
    public ResponseEntity<?> paymentSuccess(@RequestBody Map<String, Object> data) {
        log.info("POST /api/payments/success payload: {}", data);
        try {
            String razorpayOrderId = String.valueOf(data.get("razorpay_order_id"));
            String razorpayPaymentId = String.valueOf(data.get("razorpay_payment_id"));
            String razorpaySignature = String.valueOf(data.get("razorpay_signature"));

            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);

            log.info("Verifying signature for order {}", razorpayOrderId);
            Utils.verifyPaymentSignature(attributes, keySecret);

            // 1️⃣ Load payment
            Payment payment = paymentRepo.findByOrderId(razorpayOrderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + razorpayOrderId));

            // 2️⃣ Load related membership request & user BEFORE using them
            MembershipRequest req = requestRepo.findById(payment.getMembershipRequestId())
                    .orElseThrow(() -> new RuntimeException("Membership Request not found"));

            User user = req.getUser(); // com.library.lms.librario.model.User

            // 3️⃣ Update payment row with final info
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaymentId(razorpayPaymentId);
            payment.setPaymentDate(java.time.LocalDateTime.now());
            payment.setType(PaymentType.ONLINE); // membership payments are ONLINE

            if (user != null) {
                payment.setMemberName(user.getName());
                payment.setMemberEmail(user.getEmail());
            }
            paymentRepo.save(payment);
            log.info("Payment updated to SUCCESS for payment id: {}", payment.getId());

            // 4️⃣ Mark membership request as paid/completed
            req.setPaid(true);
            req.setStatus(RequestStatus.COMPLETED);
            req.setCompletedDate(java.time.LocalDateTime.now());
            requestRepo.save(req);
            log.info("MembershipRequest {} marked paid", req.getId());

            // 5️⃣ Update latest membership instead of creating a new one
            Member member = memberRepository.findTopByUser_IdOrderByEndDateDesc(user.getId())
                    .orElseThrow(() -> new RuntimeException("Member not found for user: " + user.getId()));

            member.setMembershipPlan(req.getPlan());
            member.setStartDate(LocalDate.now());
            member.setEndDate(LocalDate.now().plusMonths(req.getPlan().getDurationMonths()));
            member.setStatus(MemberStatus.ACTIVE);

            memberRepository.save(member);
            log.info("User {} assigned new plan {}", user.getId(), req.getPlan().getType());

            // 6️⃣ Send mail & notifications
            try {
                mailService.send(
                        user.getEmail(),
                        "Membership Activated",
                        "Your membership for " + req.getPlan().getType() + " is now active!"
                );
                notificationService.create(
                        user,
                        "Membership Activated",
                        "Your membership for " + req.getPlan().getType() + " is now active!",
                        com.library.lms.librario.entity.enums.NotificationType.GENERAL
                );
            } catch (Exception e) {
                log.warn("Notification/mail sending failed", e);
            }

            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (Exception e) {
            log.error("paymentSuccess error", e);
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                @RequestHeader("X-Razorpay-Signature") String signature,
                                                @Value("${razorpay.webhook_secret}") String webhookSecret) {
        log.info("Razorpay webhook received");
        try {
            boolean isValid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            if (!isValid) {
                log.warn("Invalid webhook signature");
                return ResponseEntity.status(400).body("Invalid signature");
            }

            JSONObject event = new JSONObject(payload);
            String eventType = event.getString("event");

            JSONObject paymentEntity = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            String orderId = paymentEntity.getString("order_id");
            String paymentId = paymentEntity.getString("id");
            String status = paymentEntity.getString("status"); // captured/failed

            log.info("Webhook event: {}, orderId={}, paymentId={}, status={}", eventType, orderId, paymentId, status);

            Payment payment = paymentRepo.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + orderId));

            if ("captured".equals(status)) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setPaymentId(paymentId);
            } else if ("failed".equals(status)) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setPaymentId(paymentId);
            }
            paymentRepo.save(payment);

            if ("captured".equals(status)) {
                var req = requestRepo.findById(payment.getMembershipRequestId()).orElse(null);
                if (req != null) {
                    req.setPaid(true);
                    req.setStatus(RequestStatus.COMPLETED);
                    req.setCompletedDate(java.time.LocalDateTime.now());
                    requestRepo.save(req);

                    // 🔹 Update latest membership
                    var user = req.getUser();
                    Member member = memberRepository.findTopByUser_IdOrderByEndDateDesc(user.getId())
                            .orElseThrow(() -> new RuntimeException("Member not found for user: " + user.getId()));

                    member.setMembershipPlan(req.getPlan());
                    member.setStartDate(LocalDate.now());
                    member.setEndDate(LocalDate.now().plusMonths(req.getPlan().getDurationMonths()));
                    member.setStatus(MemberStatus.ACTIVE);

                    memberRepository.save(member);
                    log.info("User {} updated to new plan {}", user.getId(), req.getPlan().getType());
                }
            }

            return ResponseEntity.ok("Webhook processed");
        } catch (Exception e) {
            log.error("Webhook processing failed", e);
            return ResponseEntity.status(500).body("Webhook error: " + e.getMessage());
        }
    }

    /** ✅ Create Razorpay order for a fine (by borrowId) */
    @PostMapping("/fine/{borrowId}")
    public ResponseEntity<?> createFineOrderById(@PathVariable Long borrowId) {
        BorrowRecord record = borrowRecordRepo.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (record.getFineAmount() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "No fine for this borrow record"));
        }

        try {
            Map<String, Object> orderData = createRazorpayFineOrder(record.getFineAmount(), borrowId);
            orderData.put("borrowId", borrowId);
            return ResponseEntity.ok(orderData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error creating fine order: " + e.getMessage()));
        }
    }

    /** ✅ Create Razorpay order for fine (from request body) */
    @PostMapping("/order/fine")
    public ResponseEntity<?> createFineOrder(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.valueOf(body.get("userId").toString());
            Long borrowId = Long.valueOf(body.get("borrowId").toString());
            Double amount = Double.valueOf(body.get("amount").toString());

            if (userId == null || borrowId == null || amount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing or invalid fields"));
            }

            Map<String, Object> orderData = createRazorpayFineOrder(amount, borrowId);
            orderData.put("borrowId", borrowId);
            return ResponseEntity.ok(orderData);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create fine order: " + e.getMessage()));
        }
    }

    /** ✅ Mark fine as paid securely after Razorpay success and record it in payments table */
    @PostMapping("/fine-success")
    public ResponseEntity<?> finePaymentSuccess(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.valueOf(body.get("userId").toString());
            Long borrowId = Long.valueOf(body.get("borrowId").toString());
            Double amount = Double.valueOf(body.get("amount").toString());
            String razorpayOrderId = body.get("razorpay_order_id").toString();
            String razorpayPaymentId = body.get("razorpay_payment_id").toString();
            String razorpaySignature = body.get("razorpay_signature").toString();

            if (userId == null || borrowId == null || amount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid request"));
            }

            // ✅ Verify Razorpay signature
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);
            Utils.verifyPaymentSignature(attributes, keySecret);

            // ✅ Mark fine as paid in BorrowRecord (existing logic)
            markFineAsPaid(userId, borrowId, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature);

            // ✅ Also record this fine payment in payments table
            //    - Avoid duplicate if a row already exists with this paymentId
            Payment payment = paymentRepo.findByPaymentId(razorpayPaymentId).orElse(null);

            if (payment == null) {
                BorrowRecord record = borrowRecordRepo.findById(borrowId)
                        .orElseThrow(() -> new RuntimeException("Borrow record not found"));

                payment = Payment.builder()
                        .userId(userId)
                        .borrowRecordId(borrowId)                      // 🔹 link to borrow record
                        .amount(BigDecimal.valueOf(amount))
                        .currency("INR")
                        .status(PaymentStatus.SUCCESS)
                        .orderId(razorpayOrderId)
                        .paymentId(razorpayPaymentId)
                        .paymentDate(java.time.LocalDateTime.now())
                        .type(PaymentType.ONLINE)                      // 🔹 online fine payment
                        .memberName(record.getUser().getName())
                        .memberEmail(record.getUser().getEmail())
                        .bookTitle(record.getBook().getTitle())
                        .build();
            } else {
                // If it exists, just ensure status is SUCCESS and time is updated
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setPaymentDate(java.time.LocalDateTime.now());
            }

            paymentRepo.save(payment);

            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /** 🔹 Helper: Create Razorpay order for fine */
    public Map<String, Object> createRazorpayFineOrder(Double amount, Long borrowId) throws RazorpayException {
        JSONObject options = new JSONObject();
        options.put("amount", (int)(amount * 100)); // in paise
        options.put("currency", "INR");
        options.put("receipt", "fine_" + borrowId);

        Order order = razorpayClient.Orders.create(options);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.get("id"));
        response.put("amount", order.get("amount"));
        response.put("currency", order.get("currency"));
        response.put("key", keyId);
        return response;
    }

    /** 🔹 Helper: Update fine record after successful payment */
    public void markFineAsPaid(Long userId, Long borrowId, Double amount,
                               String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {

        BorrowRecord record = borrowRecordRepo.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("User ID mismatch");
        }

        record.setFinePaid(true);
        record.setFineAmount(0.0);
        record.setPaymentId(razorpayPaymentId);

        borrowRecordRepo.save(record);
    }

    @PostMapping("/fine-payment/success")
    public ResponseEntity<?> handleFinePayment(
            @RequestParam Long borrowRecordId,
            @RequestParam String razorpayPaymentId) {

        Payment payment = paymentService.markFinePaymentSuccess(borrowRecordId, razorpayPaymentId);
        return ResponseEntity.ok(payment);
    }

    // ✅ Record Offline Membership Payment (Librarian Only)
    @PostMapping("/offline")
    public ResponseEntity<?> recordOfflineMembershipPayment(
            @RequestBody OfflineMembershipPaymentRequest request) {
        try {
            Payment savedPayment = paymentService.recordOfflineMembershipPayment(request);
            return ResponseEntity.ok(savedPayment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Record Offline Fine Payment (Librarian Only)
    @PostMapping("/offline-fine")
    public ResponseEntity<?> recordOfflineFinePayment(@RequestBody OfflineFinePaymentRequest request) {
        try {
            var result = paymentService.recordOfflineFinePayment(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 💰 Get all payments (History)
    @GetMapping("/history")
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    // 💵 Get only offline payments
    @GetMapping("/offline")
    public List<OfflinePaymentDTO> getOfflinePayments() {
        return paymentService.getOfflinePaymentsCombined();
    }

    // ✅ Mark as received (for manual/offline payments)
    @PutMapping("/{id}/mark-received")
    public Payment markAsReceived(@PathVariable Long id, @RequestParam String receivedBy) {
        return paymentService.markAsReceived(id, receivedBy);
    }

}





