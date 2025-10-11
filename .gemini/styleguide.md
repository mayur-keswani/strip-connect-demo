# Stripe Demo


# Key Principles
* **Readability:** Code should be easy to understand for all team members.
* **Maintainability:** Code should be easy to modify and extend.
* **Consistency:** Adhering to a consistent style across all projects improves
  collaboration and reduces errors.
* **Performance:** While readability is paramount, code should be efficient.

# Code Style
- Always use Custome Buttom component defined in /components/ui directory instead of creating another. 
- Use Tailwind class instead on inline styles.
- Dnt use static values for sizes, colors, etc. Use constants or theme variables.
- always define variables in CAPS 
    example: const PRIMARY_COLOR = "#000000";
- Dont use setState in project at all. Define variable instead of using setState hook of react.
