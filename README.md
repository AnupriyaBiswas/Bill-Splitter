Baap Ka Paisa – Smart Bill Splitter
"Baap Ka Paisa" is an interactive bill-splitting web app that lets you split restaurant/party bills item‑wise between friends, with support for tax, tip, treats, and detailed per‑person breakdowns.
Live demo: https://splitit-git-main-anupriya-biswas-projects.vercel.app/

Features
Friend management

Add friends with a quick input and button.
Edit or delete any friend.
Friends are shown as neat chips for easy selection.

Item-wise splitting
Separate sections for Food and Drinks.

Each item has:
Name
Price
Toggle for “Inclusive of tax”
Checkboxes to mark who shared that item.
“Select all” option per item.
Drag & drop between lists
Drag items between Food and Drinks lists using native HTML5 drag and drop.
​

Taxes, tips, and treats
Configurable SGST and CGST percentages.
Global tip amount split equally among all friends.

Treat feature:
One friend can pay extra.
Excess amount automatically reduces others’ shares.

Detailed breakdown

Final section shows:
Total amount owed per person.
Expand/collapse breakdown showing each item’s contribution (base, tax, tip, treat adjustments).

PDF export
“Download PDF” button generates a nicely formatted bill PDF using jsPDF and html2canvas.
​

Includes:
Summary table
Item breakdown
Tax & tip info
Per-person breakdown
Timestamp and branding.

Modern UI
Gold–black palette with cards, chips, and icons.
Responsive two-column layout that uses the full viewport width on larger screens.

Tech Stack
Frontend: React (Create React App)

Styling: Custom CSS

PDF Generation:
jspdf – client-side PDF generation
​

html2canvas – capture HTML content as an image for PDFs
​

Getting Started
Prerequisites
Node.js (LTS recommended)

npm (comes with Node.js)

Installation
Clone the repository:

bash
git clone <https://github.com/AnupriyaBiswas/Bill-Splitter>
cd <Bill-Splitter>
Install dependencies:
bash
npm install
This installs React, React Scripts, and all other dependencies including jspdf and html2canvas.
​

Start the development server:
bash
npm start
The app runs at http://localhost:3000 by default.

Usage
Add friends
Type a name in the “Friends” input and click +.
Edit a friend by clicking the ✏ icon.
Delete a friend using the ✕ icon.

Add items
In Food or Drinks, enter item name and price, then click +.
Edit name/price inline.
Mark “Inclusive of tax” if the price already includes tax.
Select which friends shared the item via checkboxes or use Select all.
Drag items between Food and Drinks lists as needed.

Configure tax, tip, and treats

Set SGST and CGST percentages in the Tax section.

Enter a tip amount in the Tip section.

Add Treats:
Choose a friend.
Enter the amount they are paying.
The app adjusts everyone’s shares accordingly.
Calculate bill

Click ⚖️ Calculate Split to compute each person’s total.
Click on a person’s row to expand/collapse their detailed breakdown.
Download PDF
After calculating, click 📥 Download PDF to export a descriptive PDF of the bill split.

Project Structure
src/App.js
Core logic:
    State for friends, items, taxes, tip, treats
    Calculation logic and breakdown generation
    Drag & drop handlers
    PDF generation with jsPDF and html2canvas
    src/App.css
    Gold–black theme
    Layout (two-column grid)
    Styles for cards, chips, buttons, and breakdown.

Deployment
The app is deployed on Vercel:
https://splitit-git-main-anupriya-biswas-projects.vercel.app/

To deploy your own fork:
Push the project to a GitHub repository.
Import the repo into Vercel.
Vercel will detect Create React App and deploy automatically with sensible defaults.
​
​

Future Improvements
Persistent storage (e.g., localStorage or backend) to save past bills.
Support for multiple currencies and custom rounding rules.
Optional user authentication for multi-session tracking.