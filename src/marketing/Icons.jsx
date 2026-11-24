const paths = {
  envelope: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  heart: <path d="M12 20.2S3.8 15.4 3.8 9.3A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 8.2 1.9c0 6.1-8.2 10.9-8.2 10.9Z" />,
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4 17 5-5 4 4 2-2 5 5" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.8" cy="18" r="2.4" />
      <circle cx="16.8" cy="16" r="2.4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c.5-3.2 2.7-5 6-5s5.5 1.8 6 5" />
      <path d="M16 5.4a3.2 3.2 0 0 1 0 6.2M18 15.2c1.8.6 2.9 2.1 3 4.8" />
    </>
  ),
  map: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0C18.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  link: (
    <>
      <path d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11.6 6" />
      <path d="M14 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7L12.4 18" />
    </>
  ),
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h12" />,
  close: <path d="M5 5l14 14M19 5 5 19" />,
  whatsapp: (
    <>
      <path d="M20 11.8a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.8Z" />
      <path d="M8.8 8.6c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4 0 .7.5.8 1.3 1.5 2.2 2 .3.1.5.1.7-.1l.6-.7c.2-.2.4-.3.6-.2l1.6.8c.2.1.3.3.3.5 0 .6-.4 1.4-.9 1.8-.5.4-1.2.6-2 .4-1.4-.3-2.9-1.1-4-2.3-1.1-1.1-1.9-2.5-2.2-3.9-.1-.8.1-1.4.5-1.8Z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5c.7 4.8 3.7 7.8 8.5 8.5-4.8.7-7.8 3.7-8.5 8.5-.7-4.8-3.7-7.8-8.5-8.5 4.8-.7 7.8-3.7 8.5-8.5Z" />
    </>
  ),
};

export function Icon({ name, size = 22, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.sparkle}
    </svg>
  );
}
