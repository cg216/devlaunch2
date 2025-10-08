export default function Quote({ text, author, source }) {
  if (!text) return null;
  return (
    <figure className="my-8 border-l-4 pl-4">
      <blockquote className="italic">“{text}”</blockquote>
      {(author || source) && (
        <figcaption className="mt-2 text-sm opacity-70">
          {author ? <span>— {author}</span> : null}
          {author && source ? " · " : null}
          {source ? <a className="underline" href={source} target="_blank" rel="noopener noreferrer">{source}</a> : null}
        </figcaption>
      )}
    </figure>
  );
}
