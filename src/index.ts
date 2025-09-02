type HTMLTag<T extends HTMLTag<T>> = {};
// interface HTML extends HTMLTag {
//   children?: HTMLTag[];
// }
// interface HTMLBody extends HTMLTag {
//   children?: HTMLTag[];
// }
type HTML<T extends HTMLTag<T>> = HTMLTag<T>;

type HTMLBody<T extends HTMLTag<T>> = T extends HTML<T> ? never : HTMLTag<T>;

type A = HTMLBody<HTML<HTMLTag<{}>>>;
type B = HTML<HTMLBody<HTMLTag<{}>>>;
