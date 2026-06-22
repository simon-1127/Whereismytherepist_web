# Where's My Therapist 🌿

**India's first all-in-one mental health platform** — AI companion, licensed therapists, psychiatrists, group therapy, and a peer community. Built for real Indian incomes, real Indian languages, and the UPI already on your phone.

> 🚀 Currently in pre-launch. This repo contains the marketing landing page.

---

## About the Project

*Where's My Therapist* is a mental health platform designed specifically for India. Most existing apps force users to choose between an AI chatbot *or* a human therapist, support only English, and require a credit card for payment. This platform is built to close every one of those gaps.

**Key differentiators:**
- 24/7 AI companion you name yourself (CBT/DBT/ACT-trained), backed by licensed therapists for real clinical sessions
- Full app experience in **10 Indian languages** — Hindi, Tamil, Telugu, Marathi, Bengali, Kannada, Gujarati, Malayalam, Punjabi, and English
- Native **UPI, GPay, PhonePe, Paytm, and EMI** support — no foreign credit card required
- **Group and family therapy** circles (6–8 people per group)
- **MediTrack** — medication reminder and adherence tracking, auto-shared with your psychiatrist
- **WellnessInsights** — mood trend charts and session progress reports visible to both patient and provider
- Pricing from **₹0** to ₹1,999/mo, designed around India's median young-professional income

---

## Pages

| File | Description |
|------|-------------|
| `index.html` | Main landing page — hero, features, pricing, comparison table, waitlist form |
| `about.html` | About the team and mission |
| `careers.html` | Open roles |
| `contact.html` | Contact form |
| `privacy-policy.html` | Privacy policy |
| `terms-of-use.html` | Terms of use |
| `data-compliance.html` | Data compliance details |
| `shared.css` | Shared stylesheet used across all pages |

---

## Tech Stack

- **HTML5** — all pages are static, no build step required
- **CSS3** — custom properties (CSS variables), animations, responsive grid layout via `shared.css`
- **Vanilla JavaScript** — scroll-triggered animations, count-up numbers, phone mockup carousel, pricing billing toggle, waitlist form

No frameworks, no dependencies, no bundler. Open `index.html` in a browser and it works.

---

## Running Locally

```bash
git clone https://github.com/simon-1127/Whereismytherepist.git
cd Whereismytherepist
# open index.html in your browser, or serve with any static file server:
npx serve .
```

---

## Pricing Tiers

| Plan | Monthly | Yearly |
|------|---------|--------|
| Free | ₹0 | ₹0 |
| Starter | ₹299/mo | ₹2,499/yr |
| Growth *(most popular)* | ₹799/mo | ₹6,999/yr |
| Complete | ₹1,999/mo | ₹17,999/yr |

Pay-per-session is also available à la carte (₹500–₹10,000 depending on provider), with no subscription required.

---

## Crisis Support

If you or someone you know is in crisis, help is available 24/7:

- **iCall (India):** 9152987821
- **Vandrevala Foundation:** 1860-2662-345
- **AASRA:** 91-22-27546669

---

## License

This project is licensed under the [GNU General Public License v2.0](LICENSE).

---

## Contributing

This is currently a pre-launch project. If you'd like to contribute or report issues, feel free to open a GitHub Issue or reach out via [the contact page](contact.html).
