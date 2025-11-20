# 🌞 MADFAM: The Solarpunk Foundry
### *From Bits to Atoms. High Tech, Deep Roots.*

> **Version:** 0.1.0 (The Blueprint)
> **The Mission:** To construct the operating system for a sustainable, sovereign future.
> **The Method:** Vertical integration from the Cloud (Enclii) to the Factory (Primavera3D).
> **The Status:** 🟢 Active Execution

---

## 📖 About This Document
This is the **Single Source of Truth** for Innovaciones MADFAM SAS de CV. It untangles our ecosystem, defines our strategy, and serves as the operating manual for our vision.

> **For the Team:** This is what we are building and why.
> **For the Investor:** This is how we capture the entire manufacturing value chain.
> **For the World:** This is our roadmap to a sustainable future.

---

## 🌍 I. The Vision
**"We are building the operating system for a world that makes its own things."**

We are not just a software company. We are a **Vertically Integrated Venture Studio** bridging the gap between Digital (Software) and Physical (Manufacturing).

### The Problem: The "Rented" Future
Currently, if you want to manufacture a product, you are forced to rent your future. You rent design software from one giant corp, rent cloud hosting from another, and buy materials from opaque supply chains. The tools don't talk to each other, leading to waste—waste of money, waste of time, and waste of carbon.

### The MADFAM Solution: The Sovereign Loop
We are building a "Solarpunk Foundry." We own the **Infrastructure**, the **Data**, the **Design Tools**, and the **Factory**.
* **Aureo Labs** 💻 builds the software.
* **Primavera3D** 🏭 uses the software to make real things.
* **MADFAM Co-labs** 🤝 shares the core science with the world.

---

## ⚙️ II. The Architecture: The "Solarpunk Stack"

Our ecosystem is organized into four biological layers. Each layer supports the one above it.

### 🪨 Layer 1: The Soil (Infrastructure)
*Managed by Aureo Labs*
* **🛡️ Enclii:** Our Sovereign PaaS. We host our own cloud because AWS is too expensive and restrictive ($100/mo vs $2k/mo).
* **🔑 Plinto:** Our Gatekeeper. Identity, SSO, and Revenue Management. It secures every app we build.

### 🌿 Layer 2: The Roots (Data Intelligence)
*Managed by Aureo Labs*
* **📡 ForgeSight:** The Pricer. Continuously scrapes global material and machine data. It knows the real cost of manufacturing.
* **📚 BlueprintTube:** The Librarian. Indexes, rates, and organizes 3D models based on printability.
* **🧭 Fortuna:** The Navigator. Analyzes problem data to tell us what to build next.

### 🪵 Layer 3: The Stem (Core Science)
*Managed by MADFAM Co-labs (Open Source)*
* **📐 geom-core:** The Shared Brain. A high-performance C++ library (WASM/Python) that analyzes geometry for printability. We give this math away to set the industry standard.

### 🍎 Layer 4: The Fruit (User Tools)
*Managed by Aureo Labs & Primavera3D*
* **🎨 Sim4D:** The Creator. Web-based CAD that uses `geom-core` and `ForgeSight` to guide the user in real-time.
* **🏷️ Cotiza Studio:** The Merchant. Automated quoting engine. It connects the customer's file to the factory's pricing logic.
* **👂 Coforma Studio:** The Evolution. Customer Advisory Board management. It keeps us listening to our users.

---

## 🔄 III. The "Primavera Mandate" (Dogfooding)
**"We trust it because we survive on it."**

Our unfair advantage is **Authenticity**. Most SaaS companies guess what manufacturers need. We **know** because we run **Primavera3D**.

1.  **The Rule:** Primavera3D is "Customer Zero."
2.  **The Test:** If **Enclii** goes down, our factory stops. If **Cotiza** calculates wrong, we lose money.
3.  **The Result:** When we sell these tools to the public, they are battle-tested, not just beta-tested.

---

## 🗣️ IV. The Narrative (Storytelling)

| Audience | The Pitch |
| :--- | :--- |
| **Startups & Devs** | **"Sovereignty as a Service."** Stop overpaying Big Tech. Build on Enclii and Plinto—the same affordable, open infrastructure that powers a real manufacturing ecosystem. |
| **Designers & Makers** | **"Design with Intelligence."** Sim4D isn't just a drawing tool; it has a brain. It tells you if your part is printable and how much it costs *while* you draw it. |
| **Fabricators** | **"Factory Manager in a Box."** You like making things, not quoting emails. Cotiza Studio automates your business using the same logic that runs Primavera3D. |
| **Investors** | **"The Flywheel."** We capture the value at every step. Every part we print makes our data smarter. Every software update makes our factory more profitable. |

---

## 🏰 V. Governance: Church & State (Repo Strategy)

We split our code to protect our business while honoring our ethos.

### 🏛️ Organization A: `madfam-io` (The Public Commons)
* **Goal:** Community, Standards, Trust.
* **License:** MPL 2.0 (Weak Copyleft) & AGPL v3.

### 🏢 Organization B: `aureo-labs` (The Private Engine)
* **Goal:** Revenue, IP Protection, Data Privacy.
* **License:** Proprietary.

#### 📦 The Repository Matrix

| Solution | GitHub Org | Visibility | License | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **geom-core** | `madfam-io` | 🌐 **Public** | **MPL 2.0** | The Science. Open for all, but improvements must be shared. |
| **Enclii (Core)** | `madfam-io` | 🌐 **Public** | **AGPL v3** | The Infra. Prevents cloud providers from stealing our code. |
| **Plinto (Core)** | `madfam-io` | 🌐 **Public** | **AGPL v3** | The Auth. Transparency builds trust in identity handling. |
| **Sim4D (Community)**| `madfam-io` | 🌐 **Public** | **MPL 2.0** | The Tool. Free editor, but connects to no marketplace. |
| **Sim4D (Official)** | `aureo-labs` | 🔒 **Private** | **Proprietary**| The Product. Injects our Marketplace & API keys. |
| **Cotiza Studio** | `aureo-labs` | 🔒 **Private** | **Proprietary**| The Cash Register. Secret pricing algorithms. |
| **ForgeSight** | `aureo-labs` | 🔒 **Private** | **Proprietary**| The Data Mine. The value is in the database, not just the script. |
| **BlueprintTube** | `aureo-labs` | 🔒 **Private** | **Proprietary**| The Index. Proprietary search algorithms. |

---

## 🗺️ VI. The Roadmap (Bootstrap Sequence)

We are solving the "Chicken and Egg" problem with this strict order of operations.

### 🏗️ Phase 1: The Foundation (Weeks 1-4)
* **Goal:** Sovereign Cloud & First Signals.
* ✅ Deploy **Enclii** (Bootstrap Mode).
* ✅ Deploy **Plinto** (Auth) on Enclii.
* ✅ Deploy **Coforma Studio** to start capturing user feedback immediately.

### 🧠 Phase 2: The Brain (Weeks 5-12)
* **Goal:** Data Harvesting & Core Science.
* 🚀 Release **geom-core** (Open Source) to GitHub.
* 🚀 Deploy **ForgeSight** (Backend) to start scraping pricing data.
* 🚀 Deploy **BlueprintTube** (Backend) to start indexing models.

### 🏭 Phase 3: The Pivot (Weeks 13-20)
* **Goal:** Internal stability (Dogfooding).
* 🚀 Deploy **Cotiza Studio** connected to ForgeSight.
* 🛑 **MANDATE:** Primavera3D stops using spreadsheets. All quotes must go through Cotiza.

### 🚀 Phase 4: The Launch (Months 6+)
* **Goal:** Public Beta.
* 🚀 Release **Sim4D** (Official Build) with Marketplace integration.
* 🚀 Open the doors to external customers.

---

## 🤝 Join the Mission
**MADFAM** is more than a company; it is a proof of concept for a better future.
* **Build with us:** `github.com/madfam-io`
* **Partner with us:** `madfam.io/colabs`

> *"The best way to predict the future is to manufacture it."*
