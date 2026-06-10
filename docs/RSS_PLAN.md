# RSS Plan

## Goal

Provide a zero-account way to follow official-source changes.

## Feed URL

`/feed.xml`

## Feed Items

Each item should come from a changelog entry and include:

- title
- date
- summary
- source URL
- affected claim ids

## Validation

Run:

```bash
curl -s https://residentevilveronica.com/feed.xml | head -20
```

Expected:

```text
Feed XML is returned and includes the latest changelog item.
```

## Constraint

RSS should be generated from changelog data. Do not build user accounts for RSS.
