# PWA Icons

The PWA requires icons for installation on mobile devices and desktop.

## Required Icons

- `icon-192.png` - 192x192px icon
- `icon-512.png` - 512x512px icon

## Generating Icons

You can generate icons from the `icon.svg` file using:

### Using ImageMagick
```bash
convert -background none icon.svg -resize 192x192 icon-192.png
convert -background none icon.svg -resize 512x512 icon-512.png
```

### Using Inkscape
```bash
inkscape icon.svg -w 192 -h 192 -o icon-192.png
inkscape icon.svg -w 512 -h 512 -o icon-512.png
```

### Using rsvg-convert
```bash
rsvg-convert -w 192 -h 192 icon.svg > icon-192.png
rsvg-convert -w 512 -h 512 icon.svg > icon-512.png
```

### Using Online Tools
You can also use online tools like:
- https://realfavicongenerator.net/
- https://www.favicon-generator.org/

For now, the application will work without icons, but they will enhance the PWA experience.
