# Source Monitoring Design

## Sources To Monitor

- Capcom press release page
- Steam store page
- Official BIOHAZARD YouTube video or channel page
- Platform store pages after they exist

## Snapshot Model

Each snapshot stores:

- source id
- checked at
- URL
- HTTP status
- extracted title
- extracted relevant text
- content hash

## Change Model

A change is created when:

- HTTP status changes
- extracted relevant text hash changes
- source URL redirects to a new canonical URL

## Human Review Rule

Automated changes create a review item. They do not automatically rewrite factual claims without human review.
