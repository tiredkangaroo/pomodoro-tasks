import { startLogin } from '../lib/api.js'

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-[1.05rem] w-[1.05rem]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

/**
 * The normalized "Continue with Google" control. Keep the label identical
 * between the homepage and the consent gate so the action is unambiguous.
 */
export default function GoogleButton({ label = 'continue with Google', extraClassName = '' }) {
  return (
    <button
      type="button"
      onClick={startLogin}
      className={[
        'inline-flex cursor-pointer items-center gap-3 rounded-full bg-white px-7 py-3.5',
        'font-body text-[0.95rem] font-bold text-black',
        'shadow-[0_2px_10px_rgba(120,84,40,0.14)]',
        'transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.98]',
        extraClassName,
      ].join(' ')}
    >
      <GoogleMark />
      {label}
    </button>
  )
}