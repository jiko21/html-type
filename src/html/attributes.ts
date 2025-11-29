export interface GlobalAttributes {
  id?: string;
  class?: string;
  style?: string;
  title?: string;
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  tabindex?: number;
  accesskey?: string;
  contenteditable?: boolean | 'true' | 'false';
  draggable?: boolean | 'true' | 'false';
  hidden?: boolean;
  spellcheck?: boolean | 'true' | 'false';
  translate?: 'yes' | 'no';
  [key: `data-${string}`]: string | number | boolean;
  role?: string;
  [key: `aria-${string}`]: string | number | boolean;
}

export interface EventAttributes {
  onclick?: string;
  ondblclick?: string;
  onmousedown?: string;
  onmouseup?: string;
  onmouseover?: string;
  onmousemove?: string;
  onmouseout?: string;
  onkeydown?: string;
  onkeyup?: string;
  onkeypress?: string;
  onfocus?: string;
  onblur?: string;
  onchange?: string;
  onsubmit?: string;
  onload?: string;
  onunload?: string;
  onresize?: string;
  onscroll?: string;
}

export interface FormAttributes {
  name?: string;
  value?: string | number;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  checked?: boolean;
  selected?: boolean;
  maxlength?: number;
  minlength?: number;
  max?: number | string;
  min?: number | string;
  step?: number | string;
  pattern?: string;
  autocomplete?: 'on' | 'off' | string;
  autofocus?: boolean;
  multiple?: boolean;
  size?: number;
  form?: string;
  formaction?: string;
  formenctype?: string;
  formmethod?: 'get' | 'post';
  formnovalidate?: boolean;
  formtarget?: '_blank' | '_self' | '_parent' | '_top' | string;
}

export interface LinkResourceAttributes {
  href?: string;
  src?: string;
  srcset?: string;
  sizes?: string;
  media?: string;
  rel?: string;
  type?: string;
  download?: boolean | string;
  target?: '_blank' | '_self' | '_parent' | '_top' | string;
  hreflang?: string;
  referrerpolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
}

export interface MediaAttributes {
  alt?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
  crossorigin?: 'anonymous' | 'use-credentials';
  usemap?: string;
  ismap?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  poster?: string;
}

export interface TableAttributes {
  colspan?: number;
  rowspan?: number;
  headers?: string;
  scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
}

export interface MetadataAttributes {
  charset?: string;
  content?: string;
  'http-equiv'?: string;
  property?: string;
}

export interface ListAttributes {
  start?: number;
  reversed?: boolean;
  type?: '1' | 'a' | 'A' | 'i' | 'I';
}

export interface EmbeddedAttributes {
  sandbox?: string;
  allow?: string;
  allowfullscreen?: boolean;
  allowpaymentrequest?: boolean;
}

export type AllHTMLAttributes = GlobalAttributes &
  EventAttributes &
  FormAttributes &
  LinkResourceAttributes &
  MediaAttributes &
  TableAttributes &
  MetadataAttributes &
  ListAttributes &
  EmbeddedAttributes;
