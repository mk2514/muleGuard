export function Icon({ name, className = "h-4 w-4" }) {
  const props = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
  };

  const paths = {
    dashboard: <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />,
    cases: (
      <>
        <path d="M4 7h16v13H4z" />
        <path d="M8 7V5h8v2" />
      </>
    ),
    sources: (
      <>
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
      </>
    ),
    entities: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M16 19a4 4 0 0 1 5-3.8" />
      </>
    ),
    graph: (
      <>
        <circle cx="6" cy="7" r="2.2" />
        <circle cx="18" cy="7" r="2.2" />
        <circle cx="12" cy="17" r="2.2" />
        <path d="M8 8.5 10.5 15M16 8.5 13.5 15M8.2 7h7.6" />
      </>
    ),
    map: (
      <>
        <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" />
        <path d="M9 4v14M15 6v14" />
      </>
    ),
    timeline: (
      <>
        <circle cx="6" cy="6" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="6" cy="18" r="2" />
        <path d="M10 6h10M10 12h10M10 18h7" />
      </>
    ),
    alerts: (
      <>
        <path d="M6 16h12l-1.2-2.2a6.5 6.5 0 0 1-.8-3.2V9a5 5 0 0 0-10 0v1.6c0 1.1-.3 2.2-.8 3.2z" />
        <path d="M10 16a2 2 0 0 0 4 0" />
      </>
    ),
    reports: (
      <>
        <path d="M7 3h8l4 4v14H7z" />
        <path d="M15 3v4h4M9 12h8M9 16h6" />
      </>
    ),
    custody: (
      <>
        <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 8.5 4.2-1.1 7-4.3 7-8.5V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
    search: <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zM16 16l4 4" />,
    bell: (
      <>
        <path d="M6 16h12l-1.2-2.2a6.5 6.5 0 0 1-.8-3.2V9a5 5 0 0 0-10 0v1.6c0 1.1-.3 2.2-.8 3.2z" />
        <path d="M10 16a2 2 0 0 0 4 0" />
      </>
    ),
    upload: <path d="M12 16V6M8 10l4-4 4 4M5 19h14" />,
    check: <path d="M5 12.5 9.5 17 19 7" />,
    chevron: <path d="M9 6l6 6-6 6" />,
    file: (
      <>
        <path d="M7 3h8l4 4v14H7z" />
        <path d="M15 3v4h4" />
      </>
    ),
    csv: <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />,
    json: <path d="M8 5c-2 0-3 1.5-3 3.5S6 12 8 12c-2 0-3 1.5-3 3.5S6 19 8 19M16 5c2 0 3 1.5 3 3.5S18 12 16 12c2 0 3 1.5 3 3.5S18 19 16 19" />,
    pdf: <path d="M7 3h8l4 4v14H7zM9 14h3a2 2 0 0 0 0-4H9v8" />,
    image: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="1.5" />
        <circle cx="9" cy="10" r="1.4" />
        <path d="M4 16l4.5-4 4 3.5L16 12l4 4" />
      </>
    ),
    video: (
      <>
        <rect x="3" y="6" width="13" height="12" rx="1.5" />
        <path d="M16 10l5-3v10l-5-3z" />
      </>
    ),
    api: <path d="M8 8H5v8h3M16 8h3v8h-3M10 12h4" />,
    phone: <path d="M7 3h4l1 4-2 1.5a12 12 0 0 0 5.5 5.5L17 12l4 1v4c-8.5 1.5-15.5-5.5-14-14z" />,
    bank: <path d="M4 9l8-5 8 5M5 9v9h14V9M3 18h18M9 12v5M15 12v5" />,
    wallet: <path d="M4 8h16v11H4zM4 8V7a2 2 0 0 1 2-2h10M16 13.5h2" />,
    ip: <path d="M5 8h14v10H5zM8 8V6a4 4 0 0 1 8 0v2M9 13h6" />,
    mail: <path d="M4 6h16v12H4zM4 6l8 7 8-7" />,
    social: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 19a7 7 0 0 1 14 0" />
      </>
    ),
    docs: (
      <>
        <path d="M7 4h8l3 3v13H7z" />
        <path d="M9 11h6M9 15h4" />
      </>
    ),
    lang: <path d="M4 6h8M8 6v12M6 18h4M14 8h7M14 12h5M14 8c1.5 4 4 8 7 10" />,
    spinner: <path d="M12 4a8 8 0 1 1-8 8" />,
    download: <path d="M12 4v12M8 12l4 4 4-4M5 19h14" />,
    logout: <path d="M9 6H5v12h4M10 12h9M15 8l4 4-4 4" />,
  };

  return <svg {...props}>{paths[name] || paths.file}</svg>;
}
