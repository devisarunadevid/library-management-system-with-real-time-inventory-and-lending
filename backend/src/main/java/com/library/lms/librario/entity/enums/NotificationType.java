package com.library.lms.librario.entity.enums;

public enum NotificationType {
    GENERAL("General Notification"),
    BOOK_CONDITION("Book Condition Alert"),
    DUE_DATE("Due Date Reminder"),
    LOW_STOCK("Low Stock Alert"),
    OVERDUE("Overdue Notice"),
    BORROW_REQUEST("Borrow Request Alert");  // 👈 now correct

    private final String defaultTitle;

    NotificationType(String defaultTitle) {
        this.defaultTitle = defaultTitle;
    }

    public String getDefaultTitle() {
        return defaultTitle;
    }
}
