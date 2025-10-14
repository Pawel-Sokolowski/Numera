# Button Visibility FAQ - "I Can't See the Button"

## Quick Answer

**The "Podgląd PDF" button IS visible!** You just need to:

1. ✅ Select a **Client** (Klient)
2. ✅ Select an **Employee** (Pełnomocnik)
3. ✅ The button becomes enabled and fully visible!

---

## Common Questions

### Q: Where is the button?

**A:** It's in the Authorization Form Dialog, at the bottom:

```
[Anuluj] [👁️ Podgląd PDF] [📄 Otwórz formularz]
         ↑ HERE
```

---

### Q: I opened the dialog but don't see it!

**A:** The button is there, but it's **disabled (grayed out)**. Look carefully at the bottom of the dialog - you'll see faint text that says "Podgląd PDF".

**Why is it grayed out?** Because you haven't selected both required fields yet.

---

### Q: How do I make it visible/clickable?

**A:** Select both required fields:

1. **Klient** dropdown → Choose a client (e.g., "Jan Kowalski")
2. **Pełnomocnik (Pracownik)** dropdown → Choose an employee (e.g., "Anna Kowalska")

After both selections, the button becomes **black text with an eye icon** and is clickable!

---

### Q: What's the difference between "Podgląd PDF" and "Otwórz formularz"?

**A:** Two different buttons, two different purposes:

| Button | What It Does | When To Use |
|--------|-------------|-------------|
| **Podgląd PDF** | Generates PDF immediately with current data | Quick preview without editing |
| **Otwórz formularz** | Opens editable form first | Need to modify fields before generating |

---

### Q: I clicked it but nothing happened!

**A:** Check these:

- ✅ Is the button enabled (black text, not gray)?
- ✅ Did you select both client AND employee?
- ✅ Look for a PDF preview popup that might have opened
- ✅ Check for error messages (red notifications)

---

### Q: Why does it show an error when I click it?

**A:** The button works! The error is about the PDF template file:

```
"Failed to fill UPL-1 form template: ..."
```

This means:
- ✅ Button is working correctly
- ❌ The PDF template file is missing from `/public/pdf-templates/`

**Solution**: Download the official UPL-1 template from the Polish Ministry of Finance and place it in the correct folder.

---

## Visual Guide

### Before (Disabled)
![Disabled](https://github.com/user-attachments/assets/ccfd8072-f2af-4b99-b40f-d9cd1258a73f)
- Gray text
- Not clickable
- Needs selections

### After (Enabled)
![Enabled](https://github.com/user-attachments/assets/3b3fefc7-2244-4581-abef-d7f820289b91)
- Black text
- Eye icon visible
- Ready to click!

---

## Still Having Issues?

### Check This:

1. **Browser zoom**: Is it at 100%? Try resetting zoom
2. **Screen size**: Scroll down in the dialog to see the buttons
3. **Browser console**: Press F12, check for JavaScript errors
4. **Cache**: Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Get Help:

- 📚 Read: [Complete Guide](PDF_PREVIEW_BUTTON_GUIDE.md)
- 📝 See: [Full Explanation](../../BUTTON_VISIBILITY_EXPLANATION.md)
- 🐛 Report: [Open an Issue](https://github.com/Pawel-Sokolowski/Numera/issues)

---

## Key Takeaway

**The button is NOT hidden** - it's just in a **disabled state** until you make the required selections. This is standard UI behavior for forms!

**TL;DR**: Select client + employee = Button becomes visible and clickable! ✨
