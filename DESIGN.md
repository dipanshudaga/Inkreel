# The Uncluttered Chronicle: Design Language Specification

## 1. Visual Manifesto
"The Uncluttered Chronicle" is a high-editorial digital archive built on the principles of **Swiss Grid Design** and **Print-Inspired Minimalism**. It rejects the noisy, algorithm-driven interfaces of modern social trackers in favor of a tranquil, focus-oriented environment. Depth is created through typographic scale and stark compartmentalization rather than shadows or gradients.

---

## 2. Color Palette
The palette is strictly monochromatic with a singular, high-intensity accent. It is designed to mimic the high-contrast experience of high-end newsprint.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Primary** | `#1A1A1A` | Logos, primary borders, headers, and critical button backgrounds. |
| **Background** | `#F7F5F0` | Warm newsprint off-white. The base for all screens to reduce eye strain. |
| **Surface** | `#EBE8DE` | Hover states, active search results, and secondary structural blocks. |
| **Text** | `#1A1A1A` | High-contrast black for maximum legibility in body and headings. |
| **Muted** | `#737373` | Metadata, timestamps, placeholders, and inactive icons. |
| **Accent** | `#DE3C26` | "Archive Vermilion." Primary CTAs, active indicators, and unread marks. |

---

## 3. Typography
The typographic system relies on a sharp contrast between an elegant, high-contrast serif and a technical, structured sans-serif.

### **Headings (Editorial)**
- **Family:** `Newsreader` (Serif)
- **Weights:** 400 (Italic), 500 (Medium)
- **Usage:** Titles, hero statements, and emphasized quotes.
- **Style:** Tight tracking (-0.02em) and generous scale.

### **Body Copy**
- **Family:** `Newsreader` (Serif)
- **Weight:** 400
- **Size:** 18px
- **Line Height:** 1.6 (Generous leading for long-form reviews)

### **UI & Metadata**
- **Family:** `Space Grotesk` (Sans-Serif)
- **Weight:** 400, 500 (Bold)
- **Size:** 12px - 14px
- **Usage:** Buttons, navigation, timestamps, category badges, and technical labels.
- **Style:** Uppercase with wide tracking (0.05em) for small UI labels.

---

## 4. UI Components & Tokens

### **Borders & Grids**
- **Utility:** `border-hairline`
- **Rule:** `1px solid #1A1A1A`
- **Logic:** All sections are divided by literal lines. No drop shadows are permitted. The grid is the primary structural element.

### **Border Radius**
- **Utility:** `radius-none`
- **Rule:** `0px`
- **Logic:** Sharp corners on every element—buttons, images, and containers—to maintain the print-document aesthetic.

### **Buttons**
- **Primary:** Background `#DE3C26`, Text `#FFFFFF`, font `Space Grotesk` 500 UPPERCASE.
- **Secondary:** Background transparent, border `1px solid #1A1A1A`, text `#1A1A1A`.
- **Interaction:** Hover transitions are immediate or subtle (0.2s), shifting to inverse colors.

### **Images**
- **Treatment:** Rendered in `grayscale(100%)` by default to preserve the monochromatic archive feel. 
- **Interaction:** Shift to full color only on hover or active selection.

---

## 5. Layout Architecture

### **Asymmetric 3-Column Grid (Dashboard)**
- **Column 1 (20%):** Navigation and global context.
- **Column 2 (50%):** The "Unified Timeline"—the primary scrolling content.
- **Column 3 (30%):** The "Shelf"—secondary stats and currently active media.

### **Split-Screen (Media Detail)**
- **Left (40%):** Sticky viewport for large-scale media art.
- **Right (60%):** Scrollable container for metadata, synopsis, and reviews.

### **Masonry (Personal Archive)**
- **Logic:** Edge-to-edge chronological grid. Year dividers intersect the hairline borders.

---

## 6. Interaction Model
- **Primary Action:** `Cmd + K` for global search, emphasizing keyboard-first navigation.
- **Logging:** Distraction-free full-screen modal with invisible borders on text areas to mimic writing on a blank page.
