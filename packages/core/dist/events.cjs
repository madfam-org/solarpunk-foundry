'use strict';

// src/events.ts
var eventCategories = [
  "user",
  // User lifecycle events
  "auth",
  // Authentication events
  "navigation",
  // Page/screen navigation
  "engagement",
  // User engagement with content
  "conversion",
  // Business conversion events
  "error",
  // Error tracking
  "feature",
  // Feature usage tracking
  "feedback"
  // User feedback events
];
var analyticsEvents = {
  // User lifecycle
  "user.signed_up": {},
  "user.signed_in": {},
  "user.signed_out": {},
  "user.upgraded": {},
  // Conversion funnel
  "funnel.started": {},
  "funnel.step_completed": {},
  "funnel.converted": {},
  "funnel.abandoned": {},
  // Engagement
  "page.viewed": {},
  "feature.used": {},
  "content.viewed": {},
  "search.performed": {},
  // Business
  "lead.captured": {},
  "demo.requested": {},
  "quote.requested": {},
  "purchase.completed": {},
  // Error
  "error.occurred": {},
  // Feedback
  "feedback.submitted": {}
};

exports.analyticsEvents = analyticsEvents;
exports.eventCategories = eventCategories;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=events.cjs.map