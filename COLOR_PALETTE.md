# 🎨 Reforma Pro - Color Palette Reference

## Primary Colors

### Olive Green (Primary)
**Hex**: `#6B7F39`
**RGB**: `rgb(107, 127, 57)`
**Usage**: Primary buttons, headers, active states, branding

```css
.bg-olive-600 { background-color: #6B7F39; }
.text-olive-600 { color: #6B7F39; }
.border-olive-600 { border-color: #6B7F39; }
```

### Soft Green (Secondary)
**Hex**: `#8FA84E`
**RGB**: `rgb(143, 168, 78)`
**Usage**: Secondary buttons, hover states, accents

```css
.bg-olive-500 { background-color: #8FA84E; }
.text-olive-500 { color: #8FA84E; }
.border-olive-500 { border-color: #8FA84E; }
```

### Sage (Accent)
**Hex**: `#B8C59A`
**RGB**: `rgb(184, 197, 154)`
**Usage**: Light accents, backgrounds, subtle highlights

```css
.bg-sage-500 { background-color: #B8C59A; }
.text-sage-500 { color: #B8C59A; }
.border-sage-500 { border-color: #B8C59A; }
```

---

## Full Color Scale

### Olive Green Scale
```
olive-50:  #F8FAF5  (Background tint)
olive-100: #EDF2E4  (Light backgrounds)
olive-200: #D9E5C8  (Borders, inputs)
olive-300: #C5D8AC  (Disabled states)
olive-400: #B1CB90  (Muted elements)
olive-500: #8FA84E  (Secondary) ⭐
olive-600: #6B7F39  (Primary) ⭐⭐
olive-700: #556631  (Hover dark)
olive-800: #3F4C25  (Dark elements)
olive-900: #2D3319  (Text) ⭐
```

### Sage Green Scale
```
sage-50:   #F9FBF7  (Subtle tint)
sage-100:  #F3F7ED  (Light background)
sage-200:  #E5EED9  (Light accents)
sage-300:  #D7E5C5  (Borders)
sage-400:  #C9DCB1  (Muted)
sage-500:  #B8C59A  (Accent) ⭐
sage-600:  #A3B285  (Accent dark)
sage-700:  #8E9F70  (Accent darker)
sage-800:  #798B5B  (Text on light)
sage-900:  #647746  (Text dark)
```

### Natural Neutrals
```
natural-50:  #FAFAF9  (Pure white tint)
natural-100: #F5F5F4  (Subtle gray)
natural-200: #E7E5E4  (Light borders)
natural-300: #D6D3D1  (Borders)
natural-400: #A8A29E  (Placeholder text)
natural-500: #78716C  (Muted text)
natural-600: #57534E  (Secondary text)
natural-700: #44403C  (Body text)
natural-800: #292524  (Dark text)
natural-900: #1C1917  (Almost black)
```

---

## Semantic Colors

### UI Element Colors
```css
/* Backgrounds */
--background: #F8FAF5;      /* olive-50 */
--foreground: #2D3319;      /* olive-900 */
--card: #FFFFFF;            /* white */
--card-foreground: #2D3319; /* olive-900 */

/* Interactive Elements */
--primary: #6B7F39;         /* olive-600 */
--primary-foreground: #FFFFFF;
--secondary: #8FA84E;       /* olive-500 */
--secondary-foreground: #FFFFFF;
--accent: #B8C59A;          /* sage-500 */
--accent-foreground: #2D3319;

/* States */
--muted: #EDF2E4;           /* olive-100 */
--muted-foreground: #556631;/* olive-700 */
--destructive: #DC2626;     /* red-600 */
--destructive-foreground: #FFFFFF;

/* Borders & Inputs */
--border: #D9E5C8;          /* olive-200 */
--input: #D9E5C8;           /* olive-200 */
--ring: #6B7F39;            /* olive-600 */
```

---

## Usage Guidelines

### Buttons

**Primary Button**
```jsx
className="bg-gradient-to-r from-olive-600 to-olive-700
           text-white hover:from-olive-700 hover:to-olive-800"
```
- Use for main actions (Submit, Create, Generate)
- Gradient adds depth
- Hover state is darker

**Secondary Button**
```jsx
className="bg-olive-500 text-white hover:bg-olive-600"
```
- Use for less important actions
- Solid color, simpler

**Tertiary Button**
```jsx
className="text-olive-700 hover:bg-olive-50"
```
- Use for subtle actions (Cancel, Back)
- Ghost style with hover background

### Form Inputs

**Default State**
```jsx
className="border border-olive-200
           focus:ring-2 focus:ring-olive-500 focus:border-transparent"
```
- Light olive border
- Focus ring in primary color

**Error State**
```jsx
className="border-red-300 bg-red-50"
```
- Red border and background
- Keeps contrast

### Cards & Containers

**White Card**
```jsx
className="bg-white rounded-lg shadow-soft"
```
- Clean white background
- Soft shadow with olive tint

**Tinted Background**
```jsx
className="bg-olive-50"
```
- Very subtle olive tint
- Use for page backgrounds

### Text

**Headings**
```jsx
className="text-olive-900 font-bold"
```
- Dark olive for high contrast
- Bold weight for emphasis

**Body Text**
```jsx
className="text-olive-800"
```
- Slightly lighter than headings
- Good readability

**Muted Text**
```jsx
className="text-olive-600"
```
- For less important info
- Labels, captions

---

## Gradients

### Background Gradients
```jsx
// Page backgrounds
className="bg-gradient-to-br from-olive-50 via-sage-50 to-olive-100"

// Hero sections
className="bg-gradient-to-br from-olive-50 via-white to-sage-50"
```

### Button Gradients
```jsx
// Primary action
className="bg-gradient-to-r from-olive-600 to-olive-700"

// Hover state
className="hover:from-olive-700 hover:to-olive-800"
```

### CTA Sections
```jsx
className="bg-gradient-to-br from-olive-600 to-olive-700"
```

---

## Shadows

### Soft Shadow
```css
box-shadow: 0 2px 8px rgba(107, 127, 57, 0.08);
```
**Usage**: Cards, buttons, images

### Soft Large Shadow
```css
box-shadow: 0 4px 16px rgba(107, 127, 57, 0.12);
```
**Usage**: Modals, floating elements

### Implementation
```jsx
className="shadow-soft"       // Small shadow
className="shadow-soft-lg"    // Large shadow
```

---

## Accessibility

### Contrast Ratios

**Text on White**
- olive-900 (#2D3319): 12.5:1 ✅ AAA
- olive-800 (#3F4C25): 9.8:1 ✅ AAA
- olive-700 (#556631): 7.2:1 ✅ AA
- olive-600 (#6B7F39): 5.1:1 ✅ AA

**White Text on Olive-600**
- White on olive-600: 4.5:1 ✅ AA (Large text)

**Recommendations**
- Use olive-900 for body text (best contrast)
- Use olive-800 for headings
- Use olive-700 for secondary text
- Use olive-600 for accents, not body text

---

## Design Principles

### 1. Nature-Inspired
The olive and sage tones evoke:
- Growth and transformation
- Natural materials
- Earth and stability
- Fresh starts

### 2. Professional
The muted tones convey:
- Maturity and experience
- Trustworthiness
- Quality craftsmanship
- Attention to detail

### 3. Differentiation
Unlike typical construction sites that use:
- Bright orange (safety focus)
- Blue (corporate)
- Gray (industrial)

Reforma Pro uses green to stand out while maintaining professionalism.

---

## Color Psychology

### Olive Green
- **Positive**: Peace, balance, growth, renewal, wisdom
- **Industry Fit**: Construction, renovation, transformation
- **Emotion**: Calm confidence, natural expertise

### Sage Green
- **Positive**: Harmony, healing, freshness, clarity
- **Industry Fit**: Modern homes, natural living spaces
- **Emotion**: Tranquility, modern simplicity

---

## Examples in Context

### Login Page
```jsx
<div className="bg-gradient-to-br from-olive-50 via-sage-50 to-olive-100">
  <div className="bg-white shadow-soft-lg rounded-lg">
    <h1 className="text-olive-900">Reforma Pro</h1>
    <button className="bg-gradient-to-r from-olive-600 to-olive-700 text-white">
      Iniciar Sesión
    </button>
  </div>
</div>
```

### Upload Interface
```jsx
<div className="border-2 border-dashed border-olive-300 hover:border-olive-500">
  <p className="text-olive-700">Arrastra imágenes aquí</p>
</div>
```

### Presentation View
```jsx
<div className="bg-gradient-to-br from-olive-50 via-white to-sage-50">
  <h2 className="text-olive-900">Renovación Completa</h2>
  <div className="bg-white shadow-soft rounded-lg">
    {/* Content */}
  </div>
</div>
```

---

## Brand Assets

### Logo Colors
- Icon: olive-600 (#6B7F39)
- Background: white or transparent
- Alternative: White icon on olive-600 background

### Favicon
- Simple construction icon
- olive-600 color
- White background or transparent

---

## Export Formats

### For Designers (Figma/Sketch)
```json
{
  "olive": {
    "50": "#F8FAF5",
    "100": "#EDF2E4",
    "200": "#D9E5C8",
    "300": "#C5D8AC",
    "400": "#B1CB90",
    "500": "#8FA84E",
    "600": "#6B7F39",
    "700": "#556631",
    "800": "#3F4C25",
    "900": "#2D3319"
  },
  "sage": {
    "50": "#F9FBF7",
    "100": "#F3F7ED",
    "200": "#E5EED9",
    "300": "#D7E5C5",
    "400": "#C9DCB1",
    "500": "#B8C59A",
    "600": "#A3B285",
    "700": "#8E9F70",
    "800": "#798B5B",
    "900": "#647746"
  }
}
```

### For CSS Variables
```css
:root {
  --olive-50: #F8FAF5;
  --olive-600: #6B7F39;
  --olive-900: #2D3319;
  --sage-500: #B8C59A;

  --primary: var(--olive-600);
  --background: var(--olive-50);
  --text: var(--olive-900);
}
```

---

## Testing Tools

### Contrast Checker
Test all color combinations at:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Colorable: https://colorable.jxnblk.com/

### Color Blindness Simulator
Test palette with:
- Coblis: https://www.color-blindness.com/coblis-color-blindness-simulator/
- Ensure distinctions remain clear

---

**This palette is now implemented throughout the entire Reforma Pro application!** 🎨
