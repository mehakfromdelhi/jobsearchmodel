# Resume Variants

Start simple:

- `cv.md` is the active resume used by the system
- `resumes/base.md` is your first base variant

As you tailor for recurring role families, add more files in this folder, for example:

- `strategy-ops.md`
- `gtm-ops.md`
- `program-management.md`
- `strategic-finance.md`

Recommended workflow:

- keep one strong `base.md`
- add targeted variants only when you see a repeated pattern in the jobs you want
- switch the active version into `cv.md` before evaluation or PDF generation

Commands:

```bash
npm run resume -- --list
npm run resume -- base
```
