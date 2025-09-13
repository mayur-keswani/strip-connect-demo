Generate clean, minimal, and maintainable UI components using **Tailwind CSS**, based on designs selected in **Figma MCP**.

---

## ✅ Rules

### 1. 🎯 Design Scope
- Only convert the **selected Figma design**.
- Do **not** scaffold unrelated sections or entire pages unless explicitly instructed.
- Avoid overengineering the output – keep it scoped and lean.

### 2. 🧱 DOM Structure
- Use the **least number of elements necessary**.
- Avoid deeply nested `<div>` trees.

#### ❌ Bad:
```html
<div><div><div><button>Click</button></div></div></div>
```

#### ✅ Good:
```html
<button class="...">Click</button>
```

### 3. 🎨 Tailwind Class Usage
- Use **built-in Tailwind CSS utility classes** only.
- **Do NOT** use arbitrary values like:
  - `w-[16px]` ❌
  - `bg-[#23424a]` ❌
- Stick to core Tailwind sizing, spacing, and color tokens.

### 4. 🛠 Custom Design Tokens
- If the required value is **not** available in core Tailwind:
  - Check `tailwind.config.js` for custom values inside `theme.extend`.
  - Use custom tokens defined there (e.g., `bg-primary`, `text-accent`).

  #### Example:
  ```js
  // tailwind.config.js
  theme: {
    extend: {
      colors: {
        primary: '#123456',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  }
  ```

  #### ✅ Then use:
  ```html
  class="bg-primary px-18"
  ```

### 5. 🚫 Avoid Console Logs
- Do not add console logs in the code




## ✅ Output Expectations
- Clean, semantic HTML using only Tailwind classes
- Minimal and purposeful DOM structure
- No arbitrary values or inline styling
- Custom tokens only if defined in `tailwind.config.js`
- Code must reflect only the selected design component