import { getPageParts } from "./static-html";

export function StaticPage({ file, transform }) {
  const parts = getPageParts(file, { transform });

  return (
    <>
      {parts.skipLink
        ? (() => {
            const { props, inner } = parts.skipLink;
            return (
              <a {...props} dangerouslySetInnerHTML={{ __html: inner }} />
            );
          })()
        : null}

      {parts.header
        ? (() => {
            const { props, inner } = parts.header;
            return (
              <header {...props} dangerouslySetInnerHTML={{ __html: inner }} />
            );
          })()
        : null}

      {parts.main
        ? (() => {
            const { props, inner } = parts.main;
            return <main {...props} dangerouslySetInnerHTML={{ __html: inner }} />;
          })()
        : null}

      {parts.footer
        ? (() => {
            const { props, inner } = parts.footer;
            return (
              <footer {...props} dangerouslySetInnerHTML={{ __html: inner }} />
            );
          })()
        : null}

      {parts.scripts.map((props, index) => (
        <script key={`${props.src || "script"}-${index}`} {...props} />
      ))}

      {parts.noscript
        ? (() => {
            const { props, inner } = parts.noscript;
            return (
              <noscript
                {...props}
                dangerouslySetInnerHTML={{ __html: inner }}
              />
            );
          })()
        : null}
    </>
  );
}
