<div align="center">

# 💰 Baap Ka Paisa  
### Smart, Item‑wise Bill Splitter

A slick React web app to split restaurant/party bills **fairly** between friends – item by item, with tax, tip, treats, drag‑and‑drop and a beautiful PDF export.

🔗 **Live App:**  
https://splitit-git-main-anupriya-biswas-projects.vercel.app/

</div>

---

## ✨ Features

- **Friend management**
  - Add friends quickly with an input + button flow.
  - Edit or delete any friend from the chip-style list.
  - Clean horizontal layout using pill chips.

- **Item-wise splitting (Food & Drinks)**
  - Separate sections for **Food** and **Drinks**.
  - Each item has:
    - Name
    - Price
    - “Inclusive of tax” toggle
    - Per‑friend participation checkboxes.
  - “Select all” shortcut per item.

- **Drag & drop between lists**
  - Drag any item card from **Food ⮂ Drinks** using native HTML5 drag & drop.

- **Taxes, tips & treats**
  - Configurable **SGST** and **CGST** percentages.
  - Global **tip** amount split equally among all friends.
  - **Treats**:
    - One friend can pay more than their share.
    - Excess amount is intelligently distributed to reduce others’ dues.

- **Per‑person breakdown**
  - Summary card showing each person’s final amount.
  - Click a name to **expand/collapse** a detailed breakdown:
    - Base share
    - Tax share
    - Tip share
    - Treat adjustments

- **PDF export**
  - “📥 Download PDF” generates a **clean, descriptive invoice‑style PDF** for the current split.
  - Includes:
    - Bill summary
    - Item breakdown
    - Tax & tip info
    - Per‑person breakdown
    - Timestamp + app branding

- **Modern gold‑black UI**
  - Custom CSS with a rich gold–black palette.
  - Card‑based layout, icons, shadows and chips.
  - Responsive two‑column grid that uses the full viewport on desktop but collapses gracefully on smaller screens.

---

## 🧱 Tech Stack

- **Framework:** React (Create React App)
- **Styling:** Custom CSS (no Tailwind)
- **PDF Generation:**  
  - [`jspdf`](https://www.npmjs.com/package/jspdf) – client‑side PDF creation  
  - [`html2canvas`](https://www.npmjs.com/package/html2canvas) – render HTML sections to images for embedding in PDFs
- **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (LTS recommended)
- **npm** (bundled with Node)

### Clone & install

