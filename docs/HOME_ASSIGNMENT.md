# Home Assignment – Concerts & Price Alerts Feature

## Overview

This assignment is based on an existing **Ticketing Microservices** application – a ticket resell platform built with Node.js, TypeScript, React (Next.js), MongoDB, and an event-driven architecture using NATS Streaming.

Your task is to extend the system by introducing two interconnected features:

1. **Concerts** – A new entity that groups tickets together (e.g., "Coldplay @ Madison Square Garden - Dec 15")
2. **Price Alerts** – Allow users to track concerts they're interested in and get notified when tickets are listed below their price threshold

The goal is not to build a perfect or complete system, but to demonstrate how you reason about architecture, service boundaries, data flow, and trade-offs in a realistic codebase.

---

## Time Expectations

| | |
|---|---|
| **Timebox** | Up to 2 days |
| **Expected effort** | ~8–12 hours |

Please manage scope intentionally. It is better to ship a smaller, well-reasoned solution than a large, unfinished one.

---

## Tools & AI Usage

You may use **any tools** you believe will make you more effective, including AI assistants and coding agents.

However, in the follow-up interview, you will be asked to:
- Explain the architectural decisions you made
- Walk through the trade-offs and why you chose specific approaches
- Discuss challenges you encountered and how you resolved them
- Demonstrate understanding of the code you've submitted

We value **your reasoning and understanding** over how the code was produced.

---

## The Product Story

> *"As a buyer on a ticket resell platform, I want to browse concerts, track the ones I'm interested in, set my maximum price, and get notified when someone lists tickets within my budget."*

---

## Requirements

### Part 1: Concerts Service (Foundation)

**Backend:**
- Create a new `concerts` microservice following existing patterns in the repository
- A Concert should have at minimum: `title`, `date`, `venue`
- Modify the tickets domain to associate each ticket with a concert (`concertId`)
- Emit appropriate events when concerts are created/updated
- Tickets can only be created for existing concerts

**Frontend:**
- Concert listing page showing all concerts
- Concert detail page showing all tickets for that concert
- Existing ticket functionality (viewing, ordering) should continue to work

### Part 2: Price Alerts (The Core Challenge)

**Backend:**
- Create an `alerts` microservice (or extend concerts service – justify your choice)
- Users can set a price alert on a concert with a `maxPrice` threshold
- When a new ticket is created that matches a user's alert criteria:
  - Same concert
  - Price ≤ user's `maxPrice`
  - Generate a notification for that user
- The notification should be retrievable by the user

**Frontend:**
- "Set Price Alert" button on concert pages with price threshold input
- View/manage alerts (see tracked concerts, remove alerts)
- Notification indicator showing when matches are available
- Notification list showing matched tickets

---

## Key Constraints

| Rule | Rationale |
|------|-----------|
| Services must not access each other's databases | Data ownership |
| Avoid synchronous service-to-service calls for core logic | Loose coupling |
| Prefer event-driven integration | Scalability, resilience |
| Follow existing conventions and patterns in the repository | Consistency |

---

## Running & Submission

**The project is expected to run locally.** No deployment or cloud infrastructure is required.

- Your solution should work with the existing local development setup using Skaffold
- You'll need to add Kubernetes deployment files and update `skaffold.yaml` for your new services — just follow the existing patterns in `infra/k8s/`
- Include clear instructions if any additional setup steps are needed
- Ensure tests can be run locally with `npm test`

---

## Testing

- Add automated tests for new or modified logic
- Tests should focus on meaningful behavior (not 100% coverage)
- Follow the existing test patterns in the codebase

---

## Documentation

Include a `SOLUTION.md` file describing:

1. **Architecture decisions**
   - How did you structure the services?
   - Where does each piece of data live?

2. **Event flow**
   - What events did you introduce?
   - Which services publish/consume which events?

3. **Data ownership & duplication**
   - What data is replicated and why?
   - How do you handle updates to replicated data?

4. **Trade-offs**
   - What would you do differently with more time?
   - What edge cases did you consider but not implement?

5. **What you intentionally left out**
   - Be explicit about scope decisions

---

## Out of Scope

You do **not** need to:
- Deploy to any cloud environment (everything runs locally)
- Modify or optimize existing Kubernetes patterns or Docker configurations (just follow the existing patterns when adding new services)
- Set up CI/CD or production infrastructure
- Modify payment, Stripe, or authentication flows
- Polish UI styling beyond basic usability
- Handle every edge case
- Implement real push notifications (polling or fetch-on-demand is fine)

---

## Bonus (Optional)

If you complete the core requirements and have time, consider:

- Handle concert cancellation cascade (cancel concert → invalidate tickets → cancel pending orders)
- Notification "read/unread" status management
- Handling out-of-order events (version mismatch scenarios)
- Discussion of how you'd scale the alert matching for millions of users

---

## What We Care About

We are interested in:

| | |
|---|---|
| **Code quality** | Clean, readable, following existing patterns |
| **Architectural reasoning** | Clear service boundaries and data ownership |
| **Event-driven thinking** | Proper use of events, understanding of eventual consistency |
| **Trade-off awareness** | Knowing when to simplify vs. when to invest |
| **Communication** | Clear documentation of decisions |

There is no single correct solution. We care much more about your **reasoning** than completeness.

---

## Getting Started

1. Follow the setup instructions in the main `README.md`
2. Explore the existing `tickets` and `orders` services to understand the patterns
3. Look at how events are defined in `common/src/events/`
4. Check how the `orders` service replicates ticket data as an example of event-driven data sync

---

Good luck, and enjoy the exercise! 🎫
