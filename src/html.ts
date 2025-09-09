import {Html, Body, Div, P} from ".";
// type A = HTML<"aaaa">;
// type B = Html<
//   Body<
//     Div<[
//       P<"Hello World">, P<"This is test">
//     ]>
//   >
// >;
/**
 * entrypoint
 */
type B = Html<[P<"Hello World">, P<"This is test">]>;
// type B = Html<P<"This is test">>;
// type B = Html<Body<Div<[P<"Hello World">, P<"This is test">]>>>;