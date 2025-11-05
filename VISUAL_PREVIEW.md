# Reforma Pro - Visual Preview Guide

## 🎨 Design Language

**Color Palette:**
- **Primary Olive**: #6B7F39 - Professional, nature-inspired
- **Secondary Green**: #8FA84E - Softer, approachable
- **Sage Accent**: #B8C59A - Light, elegant
- **Background**: #F8FAF5 - Soft white with warm undertone
- **Text**: #2D3319 - Dark olive green for readability

**Typography:**
- Font: Inter (modern, clean, professional)
- Headings: Bold, large, clear hierarchy
- Body: Comfortable line-height for readability

---

## 📱 Page-by-Page Preview

### 1. Login Page (`/login`)

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│  Gradient Background (Olive → Sage)    │
│                                         │
│              ┌───────┐                  │
│              │  🏗️   │                  │
│              │ Logo  │                  │
│              └───────┘                  │
│                                         │
│           Reforma Pro                   │
│     Presentaciones profesionales        │
│                                         │
│     ┌─────────────────────────┐        │
│     │                         │        │
│     │   Iniciar Sesión       │        │
│     │                         │        │
│     │  Email: _____________  │        │
│     │                         │        │
│     │  Pass:  _____________  │        │
│     │                         │        │
│     │  [  Iniciar Sesión  ]  │        │
│     │                         │        │
│     │  Demo Credentials:     │        │
│     │  worker@demo.com       │        │
│     │  worker123             │        │
│     │                         │        │
│     └─────────────────────────┘        │
│                                         │
│      © 2024 Reforma Pro                │
│                                         │
└─────────────────────────────────────────┘
```

**Visual Features:**
- Smooth gradient background (olive-50 → sage-50 → olive-100)
- Floating white card with soft shadow
- Circular logo badge with gradient
- Demo credentials visible for easy testing
- Smooth fade-in animations

---

### 2. Upload Interface (`/upload`)

**Header:**
```
┌────────────────────────────────────────────┐
│ 🏗️  Reforma Pro          Cerrar Sesión  │
│     Bienvenido, Worker                    │
└────────────────────────────────────────────┘
```

**Progress Steps:**
```
┌────────────────────────────────────────────┐
│                                            │
│  ① Información  →  ② Antes  →  ③ Después  →  ④ Procesar │
│  [  Active  ]     [Pending]   [Pending]      [Pending]   │
│                                            │
└────────────────────────────────────────────┘
```

**Step 1: Project Information**
```
┌─────────────────────────────────────┐
│                                     │
│  Información del Proyecto           │
│                                     │
│  Título del Proyecto *              │
│  [____________________________]     │
│                                     │
│  Descripción del Trabajo *          │
│  [____________________________]     │
│  [____________________________]     │
│  [____________________________]     │
│  (puede ser informal)               │
│  La IA mejorará esta descripción    │
│                                     │
│  Ubicación          Cliente         │
│  [__________]      [__________]     │
│                                     │
│           [Siguiente: Fotos Antes→] │
│                                     │
└─────────────────────────────────────┘
```

**Step 2 & 3: Image Upload**
```
┌─────────────────────────────────────┐
│                                     │
│  Fotos "Antes" / "Después"          │
│  Sube entre 1 y 20 fotos           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │         📸                  │   │
│  │   Arrastra imágenes o      │   │
│  │   haz clic para seleccionar│   │
│  │                             │   │
│  │   JPG, PNG, WEBP (10MB)    │   │
│  │       0/20 imágenes        │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Preview Grid (after upload):       │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │IMG│ │IMG│ │IMG│ │IMG│          │
│  └───┘ └───┘ └───┘ └───┘          │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │IMG│ │IMG│ │IMG│ │IMG│          │
│  └───┘ └───┘ └───┘ └───┘          │
│                                     │
│  [← Volver]    [Siguiente →]       │
│                                     │
└─────────────────────────────────────┘
```

**Visual Features:**
- Step indicator with progress
- Drag & drop zone with hover effects
- Image grid with remove buttons (× icon on hover)
- Smooth animations between steps
- Disabled states for incomplete forms

---

### 3. Presentation View (`/p/:token`)

**Header:**
```
┌────────────────────────────────────────────┐
│ 🏗️  Demo Construction          🖨️ Imprimir │
│     Presentación de Proyecto               │
└────────────────────────────────────────────┘
```

**Hero Section:**
```
┌─────────────────────────────────────┐
│                                     │
│   Renovación Completa de Cocina    │
│            Moderna                  │
│                                     │
│  📍 Madrid, España  📅 Enero 2024  │
│                                     │
└─────────────────────────────────────┘
```

**Before/After Slider (Main Feature):**
```
┌────────────────────────────────────────┐
│                                        │
│  Transformación del Proyecto          │
│  Desliza para ver el antes y después  │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │  ANTES              │   DESPUÉS │  │
│  │  [Old Kitchen]      │[New Kit]  │  │
│  │                  [◉]             │  │
│  │                  │⟺│             │  │
│  │                  Slider Handle   │  │
│  └─────────────────────────────────┘  │
│                                        │
│  Thumbnail Selector:                  │
│  ┌──┐ ┌──┐ ┌──┐                      │
│  │✓ │ │  │ │  │  ← Click to switch │
│  └──┘ └──┘ └──┘      image pairs    │
│                                        │
└────────────────────────────────────────┘
```

**Description Card:**
```
┌─────────────────────────────────────┐
│                                     │
│  Detalles del Proyecto              │
│                                     │
│  Transformación integral de cocina  │
│  con acabados de primera calidad.   │
│                                     │
│  • Instalación de muebles modernos  │
│  • Renovación completa del suelo    │
│  • Pintura profesional...           │
│  • Iluminación LED estratégica      │
│  • Electrodomésticos integrados     │
│                                     │
│  ┌───┬───┬───┬───┐                 │
│  │ 3 │20 │42 │100│                 │
│  │Áre│Fot│Vis│Sat│                 │
│  │as │os │tas│%  │                 │
│  └───┴───┴───┴───┘                 │
│                                     │
└─────────────────────────────────────┘
```

**Gallery Grids:**
```
┌─────────────────────────────────────┐
│  Galería Completa                   │
│                                     │
│  Estado Original:                   │
│  ┌──┐┌──┐┌──┐┌──┐                 │
│  │  ││  ││  ││  │                 │
│  └──┘└──┘└──┘└──┘                 │
│  ┌──┐┌──┐┌──┐┌──┐                 │
│  │  ││  ││  ││  │                 │
│  └──┘└──┘└──┘└──┘                 │
│                                     │
│  Resultado Final:                   │
│  ┌──┐┌──┐┌──┐┌──┐                 │
│  │  ││  ││  ││  │                 │
│  └──┘└──┘└──┘└──┘                 │
│  ┌──┐┌──┐┌──┐┌──┐                 │
│  │  ││  ││  ││  │                 │
│  └──┘└──┘└──┘└──┘                 │
│                                     │
└─────────────────────────────────────┘
```

**CTA Section:**
```
┌─────────────────────────────────────┐
│  Olive Green Gradient Background    │
│                                     │
│  ¿Te gustaría una renovación       │
│        similar?                     │
│                                     │
│  Contacta con nosotros y te        │
│  ayudaremos a transformar tu       │
│  espacio...                        │
│                                     │
│     [Solicitar Presupuesto]        │
│                                     │
└─────────────────────────────────────┘
```

**Footer:**
```
┌─────────────────────────────────────┐
│  © 2024 Demo Construction           │
│  Todos los derechos reservados      │
│                                     │
│  Creado con Reforma Pro             │
└─────────────────────────────────────┘
```

**Visual Features:**
- Interactive slider with draggable handle
- Smooth animations on scroll
- Hover effects on gallery images (scale up)
- Print-friendly layout
- Mobile responsive (stacks vertically)
- Soft shadows throughout
- Gradient CTA section

---

## 🎭 Interactive Elements

### Before/After Slider
- **Drag Handle**: White circle with olive green border
- **Interaction**:
  - Click and drag left/right
  - Touch and drag on mobile
  - Smooth transition
  - Visual feedback on hover
- **Labels**: "Antes" (left) and "Después" (right) badges

### Image Upload Zone
- **Default State**: Dashed olive border
- **Hover State**: Solid olive border, light background
- **Drag Active**: Bright olive border, green-tinted background
- **Icon**: Upload cloud icon in olive-400

### Buttons
- **Primary**: Gradient from olive-600 to olive-700
- **Hover**: Darker gradient (olive-700 to olive-800)
- **Disabled**: 50% opacity, no cursor change
- **Shadow**: Soft shadow that grows on hover

### Form Inputs
- **Default**: White background, olive-200 border
- **Focus**: Olive-500 ring, border disappears
- **Error**: Red-200 border, red-50 background

---

## 📐 Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Stacked forms
- Full-width buttons
- 2-column image grid
- Simplified navigation

### Tablet (640px - 1024px)
- 2-column forms where appropriate
- 3-column image grid
- Comfortable spacing

### Desktop (> 1024px)
- Max-width 7xl (80rem)
- 4-column image grid
- Horizontal layouts
- Ample whitespace

---

## ✨ Animation Details

### Page Transitions
- Fade in: 300ms ease-out
- Slide up: 10px transform with fade

### Interactive Elements
- Button hover: 150ms ease
- Image scale on hover: 300ms ease
- Slider drag: Instant, smooth follow

### Loading States
- Spinner: Continuous rotation
- Progress bar: Smooth width transition
- Skeleton screens: Pulse animation

---

## 🎯 Key Design Principles

1. **Natural & Professional**: Olive green evokes nature and growth
2. **Clean & Spacious**: Ample whitespace, not cramped
3. **Visual Hierarchy**: Clear headings, organized sections
4. **Consistent**: Same spacing, same shadows, same animations
5. **Accessible**: Good contrast ratios, large click targets
6. **Mobile-First**: Works perfectly on phones
7. **Performance**: Optimized images, smooth interactions

---

## 💻 CSS Custom Classes

```css
/* Soft shadows */
.shadow-soft
.shadow-soft-lg

/* Custom scrollbar */
.custom-scrollbar

/* Animations */
.animate-fadeIn

/* Gradients */
.bg-gradient-to-br from-olive-600 to-olive-700
.bg-gradient-to-r from-olive-50 via-sage-50 to-olive-100

/* Before/After Slider */
.before-after-slider
.slider-handle
```

---

## 📸 Demo Images Source

The presentation template uses high-quality demo images from Unsplash:
- Kitchen renovations
- Professional photography
- High resolution
- Free to use

In production, these will be replaced with actual project photos uploaded by workers.

---

## 🚀 To See It Live

1. Follow setup instructions in `SETUP_GUIDE.md`
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Open: http://localhost:5173
5. Login with: `worker@demo.com` / `worker123`
6. Navigate through the upload flow
7. Click "Generate Presentation" to see the final result

---

**The design is complete and ready to use!** 🎉

All that's needed is connecting the frontend to the backend APIs for full functionality.
