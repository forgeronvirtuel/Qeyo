# Blog Platform (Go + Next.js)

A modern, self-hostable blog platform built with:
- Next.js (App Router) for the public site and admin interface
- Go for the backend API
- PostgreSQL for content and analytics storage

This project is designed to be:
- Simple to deploy
- Technically transparent
- Suitable for developers who want full control over their blog infrastructure

---

## Project Goals

- Publish high-quality technical articles using Markdown
- Provide a lightweight admin interface for content management
- Collect basic, privacy-friendly analytics (page views, reading time)
- Serve as a real-world, production-grade reference architecture

This project is built incrementally. Not all features are available yet.

---

## Architecture Overview

- **Frontend**
  - Next.js (App Router)
  - Public blog + protected admin interface
  - SEO-first, performance-oriented

- **Backend**
  - Go HTTP API
  - Clean architecture (handlers, services, repositories)
  - PostgreSQL as the primary datastore

- **Content**
  - Markdown-based articles
  - Progressive migration from filesystem to database-backed storage

---

## Roadmap (High-Level)

- [ ] Public blog with Markdown content
- [ ] Basic analytics ingestion (page views, reading time)
- [ ] Admin dashboard (read-only stats)
- [ ] Article editor (Markdown + preview)
- [ ] Publication workflow (draft / published)
- [ ] Media management
- [ ] Search

---

## Licensing

This project is **source-available**, not open source.

It is licensed under the **Business Source License 1.1 (BSL)**.

### What you CAN do
- View the source code
- Self-host the platform for personal or internal business use
- Modify the code for your own needs

### What you CANNOT do without a commercial license
- Offer this software as a hosted service or SaaS
- Sell a competing managed blog platform based on this code

On the specified Change Date, the project will automatically be relicensed
under the Apache License 2.0.

For commercial licensing, hosting, or support inquiries, please contact
the project author.

---

## Status

This project is under active development.
The API, database schema, and features may change.

Contributions are not accepted at this stage.

---

## Disclaimer

This software is provided "as is", without warranty of any kind.
Use it at your own risk.