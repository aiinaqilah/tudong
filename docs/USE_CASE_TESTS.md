# Use Case Test Documentation — TUDONG.COM

## 1. Purpose
This document defines the **use case test cases** for the TUDONG.COM e-commerce
marketplace. Each test case traces to a system use case and specifies the
preconditions, steps, test data, and expected result so the behaviour can be
verified during testing.

## 2. Scope
Covers the customer storefront, shopping cart, favourites, Stripe checkout and
orders, seller management, admin management, the analytics dashboards, and
role-based access control. Out of scope: Sanity Studio internals, third-party
service internals (Stripe, Resend), and load/performance testing.

## 3. Test Environment
| Item | Value |
|------|-------|
| Application | TUDONG.COM (Next.js 16, Sanity CMS, PostgreSQL/Prisma, Better Auth) |
| Build | `npm run dev` (local) or Vercel preview deployment |
| Payment | Stripe **test mode** (test card `4242 4242 4242 4242`, any future expiry/CVC) |
| Email | Resend (transactional emails) |
| Browsers | Chrome / Edge (desktop) + mobile viewport (≤ 768px) for responsive cases |

## 4. Test Accounts (replace with your own seed data)
| Role | Email | Notes |
|------|-------|-------|
| Customer | `customer@test.com` | Standard shopper |
| Seller | `seller@test.com` | Approved seller with ≥ 1 product |
| Admin | `admin@test.com` | Role = `admin` |

## 5. Status Legend
| Status | Meaning |
|--------|---------|
| **Pass** | Actual result matches expected result |
| **Fail** | Actual result differs from expected result |
| **Blocked** | Cannot execute (dependency/precondition unmet) |
| **Pending** | Not yet executed |

> **Partial execution completed on 2026-07-10** — see the Execution Log (§7). Storefront and guest access-control cases were executed against the local dev server via HTTP; cases requiring an authenticated session or payment remain **Pending** (they need an interactive browser driver).

---

## 6. Test Cases

### 6.1 Authentication & Account (AUTH)

| ID | Use Case | Preconditions | Steps | Test Data | Expected Result | Actual | Status |
|----|----------|---------------|-------|-----------|-----------------|--------|--------|
| AUTH-01 | Register new account | Logged out | 1. Go to Sign Up 2. Enter details 3. Submit | New unique email + valid password | Account created; user is authenticated and redirected to home/dashboard | — | Pending |
| AUTH-02 | Register with existing email | An account already uses the email | 1. Sign Up with that email 2. Submit | Existing email | Registration rejected with a "email already in use" error | — | Pending |
| AUTH-03 | Register with invalid input | Logged out | 1. Sign Up 2. Enter bad email / short password 3. Submit | `not-an-email`, `123` | Validation error shown; account **not** created | — | Pending |
| AUTH-04 | Login with valid credentials | Registered account exists | 1. Go to Sign In 2. Enter credentials 3. Submit | Valid email + password | Login succeeds; header shows Sign Out & Dashboard | — | Pending |
| AUTH-05 | Login with wrong password | Registered account exists | 1. Sign In with wrong password | Valid email + wrong password | Login rejected with an error; no session created | — | Pending |
| AUTH-06 | Logout | Logged in | 1. Click Sign Out | — | Session ends; header shows Sign In / Sign Up | — | Pending |

### 6.2 Product Browsing & Search (BRW)

| ID | Use Case | Preconditions | Steps | Test Data | Expected Result | Actual | Status |
|----|----------|---------------|-------|-----------|-----------------|--------|--------|
| BRW-01 | View homepage products | Products exist | 1. Open home page | — | Product grid renders with image, title, price | `GET /` → 200; 15 product cards rendered | **Pass** |
| BRW-02 | Browse by category | Category with products exists | 1. Open Categories 2. Select a category | Category `Shawl` | Only products in that category are listed | `GET /category/Shawl` → 200; 3 products (subset of catalog) | **Pass** |
| BRW-03 | Search — match found | Matching product exists | 1. Enter keyword in search 2. Submit | `shawl` | Matching products listed | `GET /search?query=shawl` → 200; 7 matching products | **Pass** |
| BRW-04 | Search — no match | — | 1. Search a nonsense term | `zzzzzz` | Empty state / "no results" shown, no crash | `GET /search?query=zzzzzz` → 200; 0 products, no error | **Pass** |
| BRW-05 | View product details | Product exists | 1. Click a product | — | Detail page shows images, price, description, add-to-cart | `GET /product/3eaee385…` → 200; detail rendered | **Pass** |
| BRW-06 | View Sale page | ≥ 1 discounted product | 1. Open Sale | — | Only discounted/campaign products listed with reduced price | `GET /sale` → 200; 2 discounted products | **Pass** |
| BRW-07 | NEW badge (recency) | Product created < 14 days ago | 1. View that product card | Product created recently | Green **NEW** badge is shown | `GET /` → `NEW` badge rendered 10× | **Pass** |
| BRW-08 | Discount badge | Product on sale | 1. View a discounted product card | Product with discount | **-N%** badge and struck-through original price shown | `GET /sale` → `-50%` badge + line-through original price | **Pass** |
| BRW-09 | Recommended products | Product has colour(s) | 1. Open a product with colours | — | "You might also like" shows colour-related products | `GET /product/…` → "You might also like" + 3 recommendations | **Pass** |
| BRW-10 | Mobile hamburger menu | Mobile viewport (≤ 768px) | 1. Tap ☰ 2. Tap a category / Sale | — | Menu opens; navigation works; menu closes on selection / backdrop / Esc | Not executed — client-side toggle needs interactive browser | Pending |

### 6.3 Shopping Cart (CART)

| ID | Use Case | Preconditions | Steps | Test Data | Expected Result | Actual | Status |
|----|----------|---------------|-------|-----------|-----------------|--------|--------|
| CART-01 | Add product to cart | Product in stock | 1. Open product 2. Add to cart | — | Item added; cart count increments; cart drawer opens | — | Pending |
| CART-02 | View cart contents | ≥ 1 item in cart | 1. Open cart drawer | — | Items, quantities, unit prices, and total shown | — | Pending |
| CART-03 | Update quantity | ≥ 1 item in cart | 1. Increase then decrease quantity | — | Line quantity and cart total recalculate correctly | — | Pending |
| CART-04 | Remove item | ≥ 1 item in cart | 1. Remove an item | — | Item removed; total updates; empty state if last item | — | Pending |
| CART-05 | Cart persistence | Logged-in user with items | 1. Add items 2. Log out 3. Log back in | — | Cart items are restored (persisted in database) | — | Pending |
| CART-06 | Free-shipping threshold | — | 1. Add items below then above RM150 | Subtotal RM149 → RM151 | Free-shipping progress/notice reflects the RM150 threshold | — | Pending |
| CART-07 | Apply valid promo code | Active promo code exists | 1. At cart/checkout enter code 2. Apply | e.g. `HEMAT10` | Discount applied; total reduced; confirmation shown | — | Pending |
| CART-08 | Apply invalid/expired code | — | 1. Enter unknown or expired code 2. Apply | `EXPIRED99` | Code rejected with an error; total unchanged | — | Pending |

### 6.4 Favourites / Wishlist (FAV)

| ID | Use Case | Preconditions | Steps | Test Data | Expected Result | Actual | Status |
|----|----------|---------------|-------|-----------|-----------------|--------|--------|
| FAV-01 | Add to favourites | Logged in | 1. Click heart on a product | — | Product marked favourited; appears in Favourites | — | Pending |
| FAV-02 | Duplicate prevention | Product already favourited | 1. Toggle heart off then on | — | No duplicate rows; toggles cleanly (unique per user+product) | — | Pending |
| FAV-03 | View favourites | ≥ 1 favourite | 1. Go to Dashboard → Favourites | — | Favourited products listed | — | Pending |
| FAV-04 | Remove favourite | ≥ 1 favourite | 1. Un-heart a product | — | Product removed from Favourites | — | Pending |

### 6.5 Checkout & Orders (CHK)

| ID | Use Case | Preconditions | Steps | Test Data | Expected Result | Actual | Status |
|----|----------|---------------|-------|-----------|-----------------|--------|--------|
| CHK-01 | Proceed to checkout | Logged in, cart not empty | 1. Open cart 2. Checkout | — | Redirected to Stripe Checkout with correct line items & total | — | Pending |
| CHK-02 | Complete payment | On Stripe Checkout | 1. Pay with test card | `4242 4242 4242 4242` | Payment succeeds; order created; cart cleared | — | Pending |
| CHK-03 | Checkout success page | Payment completed | 1. Return from Stripe | — | Success page shown with order confirmation | — | Pending |
| CHK-04 | View my orders | ≥ 1 order | 1. Dashboard → My Orders | — | Order(s) listed with number, total, status, date | — | Pending |
| CHK-05 | View order tracking | Order has tracking | 1. Open an order | — | Status and tracking number/link displayed | — | Pending |
| CHK-06 | Confirm delivery | Order status = SHIPPED, owned by customer | 1. Open order 2. Confirm received | — | Status → DELIVERED; seller notified by email | — | Pending |

### 6.6 Seller Management (SEL)

| ID | Use Case | Preconditions | Steps | Test Data | Expected Result | Actual | Status |
|----|----------|---------------|-------|-----------|-----------------|--------|--------|
| SEL-01 | Apply to become seller | Logged-in customer, no prior application | 1. Dashboard → Apply as Seller 2. Fill form 3. Submit | Brand name + description | Application submitted with status PENDING | — | Pending |
| SEL-02 | Prevent duplicate application | Application already submitted | 1. Open Apply as Seller again | — | Existing application state shown; cannot submit a second | — | Pending |
| SEL-03 | Create product | Logged in as seller | 1. Products → New 2. Fill fields + image 3. Save | Title, price, stock, image | Product created and listed under seller's products | — | Pending |
| SEL-04 | Edit product | Seller owns product | 1. Edit a product 2. Change price/stock 3. Save | New price | Changes saved and reflected on storefront | — | Pending |
| SEL-05 | Delete product | Seller owns product | 1. Delete a product 2. Confirm | — | Product removed from catalog | — | Pending |
| SEL-06 | Create collection | Logged in as seller | 1. Collections → New 2. Save | Collection title | Collection created and selectable on products | — | Pending |
| SEL-07 | View own orders only | Orders contain seller's items | 1. Seller → Orders | — | Only orders containing this seller's products are shown | — | Pending |
| SEL-08 | Update order status | Seller owns order | 1. Open order 2. Set status = SHIPPED | Tracking no. | Status → SHIPPED; customer receives shipping email | — | Pending |
| SEL-09 | Add tracking info | Seller owns order | 1. Enter tracking number + URL 2. Save | Poslaju/J&T no. | Tracking saved and visible to the customer | — | Pending |
| SEL-10 | Cannot edit others' products | Product owned by another seller | 1. Attempt to open its edit URL | Foreign product ID | Access denied / not found; no edit possible | — | Pending |

### 6.7 Admin Management (ADM)

| ID | Use Case | Preconditions | Steps | Test Data | Expected Result | Actual | Status |
|----|----------|---------------|-------|-----------|-----------------|--------|--------|
| ADM-01 | View all users | Logged in as admin | 1. Admin → Users | — | All users listed with role | — | Pending |
| ADM-02 | View all orders | Logged in as admin | 1. Admin → All Orders | — | All marketplace orders listed | — | Pending |
| ADM-03 | Approve seller application | ≥ 1 PENDING application | 1. Admin → Applications 2. Approve one | — | Status → APPROVED; applicant's role becomes `seller` | — | Pending |
| ADM-04 | Reject seller application | ≥ 1 PENDING application | 1. Reject an application | — | Status → REJECTED; applicant remains a customer | — | Pending |

### 6.8 Analytics Dashboards (ANL)

| ID | Use Case | Preconditions | Steps | Test Data | Expected Result | Actual | Status |
|----|----------|---------------|-------|-----------|-----------------|--------|--------|
| ANL-01 | Seller analytics render | Logged in as seller with orders | 1. Seller → Analytics | — | KPI tiles, 14-day revenue chart, top products, status donut render | — | Pending |
| ANL-02 | Seller revenue is scoped | Multi-seller order exists | 1. View seller revenue KPI | — | Revenue counts **only** this seller's line items | — | Pending |
| ANL-03 | Admin analytics render | Logged in as admin | 1. Admin → Analytics | — | Marketplace-wide KPIs and charts render | — | Pending |
| ANL-04 | Empty-state handling | Account with no orders | 1. Open Analytics | — | Charts show zero/empty states gracefully (no crash) | — | Pending |

### 6.9 Access Control — negative cases (ACL)

| ID | Use Case | Preconditions | Steps | Test Data | Expected Result | Actual | Status |
|----|----------|---------------|-------|-----------|-----------------|--------|--------|
| ACL-01 | Guest blocked from dashboard | Logged out | 1. Navigate to `/dashboard` | — | Redirected to the login page | `GET /dashboard` (no session) → 307 → `/api/login` | **Pass** |
| ACL-02 | Customer blocked from seller area | Logged in as customer | 1. Navigate to `/dashboard/seller` | — | Access denied / redirected; no seller tools shown | Not executed — needs authenticated customer session (guest → 307 confirmed) | Pending |
| ACL-03 | Non-admin blocked from admin area | Logged in as customer/seller | 1. Navigate to `/dashboard/admin` | — | Access denied / redirected | Not executed — needs authenticated non-admin session (guest → 307 confirmed) | Pending |
| ACL-04 | Seller data isolation | Logged in as seller | 1. View products & orders | — | Only the seller's own products/orders are visible | Not executed — needs authenticated seller session | Pending |

---

## 7. Execution Log

**Run date:** 2026-07-10  
**Method:** HTTP requests (`curl`) against the local development server (`next dev`, `http://localhost:3000`).  
**Coverage:** storefront rendering and guest access-control guards. Cases requiring an authenticated session, a form submission, or a Stripe payment were **not** executed in this run — they need an interactive browser driver — and remain *Pending*.

| Case | Evidence observed |
|------|-------------------|
| BRW-01 | `GET /` → 200; 15 product cards |
| BRW-02 | `GET /category/Shawl` → 200; 3 products |
| BRW-03 | `GET /search?query=shawl` → 200; 7 results |
| BRW-04 | `GET /search?query=zzzzzz` → 200; 0 results, no error |
| BRW-05 | `GET /product/3eaee385…` → 200 |
| BRW-06 | `GET /sale` → 200; 2 discounted products |
| BRW-07 | `GET /` → `NEW` badge rendered 10× |
| BRW-08 | `GET /sale` → `-50%` badge + struck-through price |
| BRW-09 | `GET /product/…` → "You might also like" + 3 recommendations |
| ACL-01 | `GET /dashboard` (no session) → 307 → `/api/login` |

**Additional observations (not numbered cases):**
- Button-label change verified live: "ADD TO CART" present (44×), "GRAB IT NOW" absent (0×).
- Guest guards confirmed on `/dashboard/seller`, `/dashboard/admin`, `/dashboard/seller/analytics`, `/dashboard/admin/analytics`, `/dashboard/user/orders`, `/dashboard/user/favorites` — all 307 → `/api/login`.

---

## 8. Test Summary

| Module | Cases | Pass | Fail | Blocked | Pending |
|--------|:-----:|:----:|:----:|:-------:|:-------:|
| Authentication (AUTH) | 6 | 0 | 0 | 0 | 6 |
| Browsing & Search (BRW) | 10 | 9 | 0 | 0 | 1 |
| Shopping Cart (CART) | 8 | 0 | 0 | 0 | 8 |
| Favourites (FAV) | 4 | 0 | 0 | 0 | 4 |
| Checkout & Orders (CHK) | 6 | 0 | 0 | 0 | 6 |
| Seller Management (SEL) | 10 | 0 | 0 | 0 | 10 |
| Admin Management (ADM) | 4 | 0 | 0 | 0 | 4 |
| Analytics (ANL) | 4 | 0 | 0 | 0 | 4 |
| Access Control (ACL) | 4 | 1 | 0 | 0 | 3 |
| **Total** | **56** | **10** | **0** | **0** | **46** |

---

*Derived from the application's implemented features (`src/app`, `src/actions`, `src/components`, and the Sanity schemas). Update this document as features change, and fill in `Actual Result` / `Status` during each test run.*
