import type { Body, Div, Html, P } from '../src/html';

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
// type B = Html<[P<'Hello World'>, P<'This is test'>]>;
// type B = Html<P<"This is test">>;
type ComplexHtml = Html<
  Body<
    [
      Div<[P<'First paragraph'>, P<'Second paragraph'>]>,
      P<'test'>,
      Div<[P<'test1'>, Div<P<'test2'>>]>,
    ]
  >
>;
