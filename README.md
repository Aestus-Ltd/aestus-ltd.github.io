# Aestus: static GitHub Pages website

This folder is a standalone website. It does not need a Node server, Cloudflare Worker, database, API proxy, or an Internet Archive connection to read the included PDFs. HTML, CSS, JavaScript and the PDF.js worker run in the visitor's browser. Node is used only for the optional build/preview commands and the GitHub Actions deployment workflow.

## Publish

1. Put this folder's **contents** at the root of your GitHub repository, including `.github/`, `.nojekyll`, `pdfs/`, and `vendor/`. Use GitHub Desktop or Git to transfer the PDF files.
2. In the repository, open **Settings > Pages > Build and deployment > Source > GitHub Actions**.
3. Push to `main` or `master`, or run **Publish Aestus to GitHub Pages** from the Actions tab.

The workflow automatically handles both `username.github.io/repository/` project sites and domains such as `aestus.ltd`. It publishes a real `404.html` page with correct links and assets even for missing nested addresses.

## Individual PDFs

All files live in **`pdfs/`**. The library looks up their paths in **`library-catalog.json`**. Each publication's `readUrl` points to one PDF. Filenames are case-sensitive on GitHub Pages. Keep the filename and `readUrl` in agreement when replacing a file.

The provided PDFs are smaller copies of the original collection. Original filenames, page order, page counts, embedded chapter outlines, and selectable text are preserved. Images were optimized for reading on the web. Full-resolution originals remain linked from the reader. The files in your Downloads folder were not changed. Identical source copies share one library entry.

To add another PDF, put it in `pdfs/` and add an entry to `library-catalog.json` with a unique `id`, `title`, byte count in `bytes`, `files` array, `section`, `subsection`, and a URL-encoded relative `readUrl` such as `./pdfs/New%20Manual.pdf`. Add new subjects to the `sections` tree. The optional `url` points to an original download; it can equal `readUrl` for a local-only document. Update the two catalog counts when adding entries. No runtime API is needed.

## Custom domain: aestus.ltd

Add `aestus.ltd` under **Settings > Pages > Custom domain** before changing DNS. Then use these four A records for the root host (`@`):

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

These GitHub Pages records replace the earlier Sites web-hosting A records when you switch hosting. Keep the email provider's MX and email TXT records. Enable **Enforce HTTPS** when available. With the included Actions workflow, GitHub manages the custom domain setting; a CNAME file is not required.

Reference: [GitHub's domain setup instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Preview locally

With Node.js installed, run:

```
node scripts/static-preview.mjs
```

Open the printed localhost URL. This is a static file server with no application backend. Opening `index.html` directly through `file://` is not supported by the PDF worker and catalog fetch.

To test a repository subfolder:

```
node scripts/configure-pages.mjs --base-path /aestus/ --site-url https://example.github.io/aestus
node scripts/verify-pages.mjs --directory _site
node scripts/static-preview.mjs --directory _site --base-path /aestus/
```

## Notes

- Contact links open the visitor's email client at `ceo@aestus.ltd`; sending mail does not require a backend.
- Dark mode and reading position are saved in the visitor's browser.
- This export does not include the sign-in/access controls of the existing Sites hosting. GitHub Pages access follows your GitHub plan and repository Pages settings.
- GitHub Pages limits the published site to 1 GB. The included verification command checks this and checks that each PDF is under GitHub's 100 MB regular Git file limit.
- PDF.js is redistributed with its Apache 2.0 license under `vendor/pdfjs/LICENSE`. Fonts are bundled under `fonts/` with their OFL licenses.
