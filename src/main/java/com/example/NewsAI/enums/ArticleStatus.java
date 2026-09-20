package com.example.NewsAI.enums;

public enum ArticleStatus {
    DRAFT,
    PENDING_REVIEW,
    PUBLISHED,
    REJECTED,
    // Legacy values kept so existing database rows remain readable.
    ACTIVE,
    HIDDEN
}
