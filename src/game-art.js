const paths = {
  pulse: `<path d="M12 52h17l9-22 13 43 9-21h16" stroke="url(#grad)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,

  target: `<circle cx="50" cy="50" r="34" stroke="url(#grad)" stroke-width="5"/><circle cx="50" cy="50" r="22" stroke="url(#grad)" stroke-width="5"/><circle cx="50" cy="50" r="8" fill="url(#grad)"/><path d="M53 47 78 22m-12 0h12v12" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,

  gem: `<path d="M28 16h44l17 23-39 46-39-46z" fill="url(#grad)" fill-opacity=".24" stroke="url(#grad)" stroke-width="4" stroke-linejoin="round"/><path d="m28 16 11 23 11 46 11-46 11-23M6 39h88" stroke="url(#grad)" stroke-width="3" stroke-linejoin="round"/>`,

  star: `<path d="m50 9 12 27 29 3-22 19 7 29-26-15-26 15 7-29L9 39l29-3z" fill="url(#grad)" fill-opacity=".25" stroke="url(#grad)" stroke-width="4" stroke-linejoin="round"/>`,

  hex: `<path d="m50 8 35 21v42L50 92 15 71V29z" fill="url(#grad)" fill-opacity=".18" stroke="url(#grad)" stroke-width="4"/><path d="m50 27 19 12v22L50 73 31 61V39z" stroke="#fff" stroke-opacity=".8" stroke-width="3"/>`,

  droplet: `<path d="M50 9C41 27 20 46 20 63a30 30 0 0 0 60 0C80 46 59 27 50 9Z" fill="url(#grad)" fill-opacity=".3" stroke="url(#grad)" stroke-width="4"/><path d="M34 63a16 16 0 0 0 13 15" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,

  bolt: `<path d="M56 7 23 54h23l-4 39 35-52H54z" fill="url(#grad)" stroke="#fff" stroke-opacity=".8" stroke-width="2" stroke-linejoin="round"/>`,

  orbit: `<circle cx="50" cy="50" r="7" fill="url(#grad)"/><ellipse cx="50" cy="50" rx="38" ry="16" stroke="url(#grad)" stroke-width="4" transform="rotate(-35 50 50)"/><ellipse cx="50" cy="50" rx="38" ry="16" stroke="url(#grad)" stroke-width="4" transform="rotate(35 50 50)"/><circle cx="81" cy="27" r="5" fill="#fff"/>`,

  moon: `<path d="M67 14a36 36 0 1 0 20 60A38 38 0 0 1 67 14Z" fill="url(#grad)" stroke="#fff" stroke-opacity=".65" stroke-width="3"/>`,

  crown: `<path d="m12 31 23 19 15-31 15 31 23-19-8 48H20z" fill="url(#grad)" fill-opacity=".28" stroke="url(#grad)" stroke-width="4" stroke-linejoin="round"/><path d="M21 66h58" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,

  brain: `<path d="M49 22c-7-13-25-7-24 6-13 2-15 20-5 27-8 13 2 26 15 24 3 10 14 12 18 3V25c0-5-2-7-4-3Zm3 0c7-13 25-7 24 6 13 2 15 20 5 27 8 13-2 26-15 24-3 10-14 12-18 3V25c0-5 2-7 4-3Z" fill="url(#grad)" fill-opacity=".23" stroke="url(#grad)" stroke-width="4" stroke-linejoin="round"/>`,

  cards: `<rect x="20" y="18" width="43" height="57" rx="7" fill="#111e36" stroke="url(#grad)" stroke-width="4" transform="rotate(-12 41 46)"/><rect x="37" y="23" width="43" height="57" rx="7" fill="#172a45" stroke="url(#grad)" stroke-width="4" transform="rotate(10 58 51)"/><path d="M51 39h15m-7-7v15" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,

  x: `<path d="M23 23 77 77M77 23 23 77" stroke="url(#grad)" stroke-width="12" stroke-linecap="round"/>`,

  o: `<circle cx="50" cy="50" r="29" stroke="url(#grad)" stroke-width="11"/>`,

  runner: `<circle cx="58" cy="18" r="8" fill="url(#grad)"/><path d="m50 32-13 20 18 8 12-17m-30 9-14 19m32-10-4 24m-7-40 22 1 13 14" stroke="url(#grad)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,

  food: `<circle cx="50" cy="54" r="22" fill="url(#grad)"/><path d="M50 31q-2-15 12-20M49 25q-12-10-20-2" stroke="#8affc1" stroke-width="5" stroke-linecap="round"/>`,

  obstacle: `<path d="M25 16h50l9 68H16z" fill="url(#grad)" fill-opacity=".24" stroke="url(#grad)" stroke-width="4" stroke-linejoin="round"/><path d="m32 28 36 37M68 28 32 65" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,

  clock: `<circle cx="50" cy="52" r="34" stroke="url(#grad)" stroke-width="5"/><path d="M50 29v24l17 10M38 8h24" stroke="url(#grad)" stroke-width="5" stroke-linecap="round"/>`,

  numbers: `<path d="M22 30h56M22 50h56M22 70h56" stroke="url(#grad)" stroke-width="5" stroke-linecap="round"/><circle cx="35" cy="30" r="8" fill="#111d31" stroke="#fff" stroke-width="3"/><circle cx="64" cy="50" r="8" fill="#111d31" stroke="#fff" stroke-width="3"/><circle cx="43" cy="70" r="8" fill="#111d31" stroke="#fff" stroke-width="3"/>`,

  colors: `<circle cx="50" cy="50" r="34" stroke="#ff5f7d" stroke-width="12" stroke-dasharray="45 169" transform="rotate(-90 50 50)"/><circle cx="50" cy="50" r="34" stroke="#52a5ff" stroke-width="12" stroke-dasharray="45 169"/><circle cx="50" cy="50" r="34" stroke="#41e6b0" stroke-width="12" stroke-dasharray="45 169" transform="rotate(90 50 50)"/><circle cx="50" cy="50" r="34" stroke="#ffd45b" stroke-width="12" stroke-dasharray="45 169" transform="rotate(180 50 50)"/>`,

  puzzle: `<path d="M20 20h23q-5 15 8 15t8-15h21v22q-15-5-15 8t15 8v22H57q5-15-8-15t-6 15H20V57q15 5 15-8t-15-6z" fill="url(#grad)" fill-opacity=".22" stroke="url(#grad)" stroke-width="4" stroke-linejoin="round"/>`
};

let nextGradientId = 0;

export function gameArt(name, size = 64, extra = '') {
  const art = paths[name] || paths.pulse;
  const id = `pulseGrad${++nextGradientId}`;

  return `<svg class="pulse-art ${extra}" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${id}" x1="8" y1="5" x2="92" y2="95" gradientUnits="userSpaceOnUse">
        <stop stop-color="#69F5FF"/>
        <stop offset=".52" stop-color="#6578FF"/>
        <stop offset="1" stop-color="#D16BFF"/>
      </linearGradient>
    </defs>
    ${art.replaceAll('url(#grad)', `url(#${id})`)}
  </svg>`;
}
