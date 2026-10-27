# Portfolio Design Token Standard

Every project has its own visual identity, but all projects use the same semantic token grammar:

- color roles: brand, accent, success, warning, danger, surface, canvas, text, muted, border, focus;
- typography roles: display, h1, h2, h3, body, small, caption, mono;
- spacing: 4px base scale;
- component sizes: small, medium, large;
- elevation: three levels maximum;
- motion: fast, standard, deliberate plus reduced-motion behavior;
- layout: shared breakpoints and container-query preference;
- charts: semantic series and accessible data alternative;
- z-index: named layers only (`base`, `sticky`, `popover`, `dialog`, `toast`, `debug`).

Framework mappings belong in each project's `03-design-tokens.md`. No project may scatter brand hex values or arbitrary spacing across components.
