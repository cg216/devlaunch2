'use client';
export default function GlobalError({ error }) {
  return (
    <html><body style={{padding:24,fontFamily:"system-ui"}}>
      <h1>Oops — something went wrong</h1>
      <pre style={{whiteSpace:"pre-wrap"}}>{String(error?.message||"Unknown error")}</pre>
    </body></html>
  );
}
