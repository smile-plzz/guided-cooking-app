/**
 * Inline icon set. Hand-rolled rather than pulled from a library so the bundle
 * carries exactly the 24 glyphs the app uses and they all share one stroke
 * weight. Every icon inherits `currentColor` and sizes from the `size` prop.
 */

function Icon({ size = 20, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Search = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const Heart = ({ filled, ...p }) => (
  <Icon {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5c0 5.15-7 9.5-7 9.5Z" />
  </Icon>
);

export const Clock = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Icon>
);

export const Users = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.5a3.2 3.2 0 0 1 0 6.2" />
    <path d="M17.5 14.2A5.5 5.5 0 0 1 20.5 19" />
  </Icon>
);

export const Flame = (p) => (
  <Icon {...p}>
    <path d="M12 3c.5 3 3 4 3 7a3 3 0 0 1-6 0c0-1 .4-1.8 1-2.4" />
    <path d="M12 21a6 6 0 0 0 6-6c0-4-3-5.5-4-9-3 2-8 4.5-8 9a6 6 0 0 0 6 6Z" />
  </Icon>
);

export const Plus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const Minus = (p) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
);

export const Check = (p) => (
  <Icon {...p}>
    <path d="m5 13 4.5 4.5L19 7" />
  </Icon>
);

export const X = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const Trash = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="M6.5 7 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
  </Icon>
);

export const Pencil = (p) => (
  <Icon {...p}>
    <path d="M4 20h4l10-10a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20Z" />
    <path d="m13.5 6.5 4 4" />
  </Icon>
);

export const ChevronLeft = (p) => (
  <Icon {...p}>
    <path d="m14.5 5-6.5 7 6.5 7" />
  </Icon>
);

export const ChevronRight = (p) => (
  <Icon {...p}>
    <path d="m9.5 5 6.5 7-6.5 7" />
  </Icon>
);

export const ChevronDown = (p) => (
  <Icon {...p}>
    <path d="m5 9 7 6.5L19 9" />
  </Icon>
);

export const ArrowLeft = (p) => (
  <Icon {...p}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </Icon>
);

export const Play = (p) => (
  <Icon {...p}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" />
  </Icon>
);

export const Pause = (p) => (
  <Icon {...p}>
    <path d="M9.5 5v14M14.5 5v14" />
  </Icon>
);

export const Rotate = (p) => (
  <Icon {...p}>
    <path d="M4 12a8 8 0 1 1 2.5 5.8" />
    <path d="M4 19v-5h5" />
  </Icon>
);

export const Basket = (p) => (
  <Icon {...p}>
    <path d="M4 9h16l-1.4 9.2A2 2 0 0 1 16.6 20H7.4a2 2 0 0 1-2-1.8L4 9Z" />
    <path d="m8.5 9 2-5M15.5 9l-2-5" />
  </Icon>
);

export const Calendar = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3.5V6.5M16 3.5V6.5" />
  </Icon>
);

export const Fridge = (p) => (
  <Icon {...p}>
    <rect x="5.5" y="3" width="13" height="18" rx="2.5" />
    <path d="M5.5 10h13M9 6.5v1.5M9 12.5V15" />
  </Icon>
);

export const Book = (p) => (
  <Icon {...p}>
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Z" />
    <path d="M5 19.5A1.5 1.5 0 0 1 6.5 21H18v-3" />
  </Icon>
);

export const Sun = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </Icon>
);

export const Moon = (p) => (
  <Icon {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </Icon>
);

export const Menu = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const Swap = (p) => (
  <Icon {...p}>
    <path d="M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5" />
    <path d="M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5" />
  </Icon>
);

export const Note = (p) => (
  <Icon {...p}>
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V15l-5 5H6.5A1.5 1.5 0 0 1 5 18.5v-14Z" />
    <path d="M19 15h-3.5A1.5 1.5 0 0 0 14 16.5V20M8.5 8h7M8.5 12h5" />
  </Icon>
);

export const Sparkle = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9L4.5 10.8 10.2 9 12 3.5Z" />
  </Icon>
);

export const Download = (p) => (
  <Icon {...p}>
    <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
    <path d="M5 19h14" />
  </Icon>
);

export const Upload = (p) => (
  <Icon {...p}>
    <path d="M12 16V5m0 0 4 4m-4-4-4 4" />
    <path d="M5 19h14" />
  </Icon>
);

export const Alert = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v5M12 16.2v.3" />
  </Icon>
);

export const Info = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.8v.3" />
  </Icon>
);

export const Wifi = (p) => (
  <Icon {...p}>
    <path d="M2.5 9a14 14 0 0 1 19 0M6 12.5a9 9 0 0 1 12 0M9.5 16a4 4 0 0 1 5 0" />
    <path d="M12 19.5v.2" />
  </Icon>
);
