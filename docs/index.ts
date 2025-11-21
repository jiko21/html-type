import type { Body, Div, Html, P } from '../src/html';

type PageHtml = Html<
  Body<[
    Div<'Hello'>,
    Div<[P<'This is a page of html-type.'>]>,
    Div<[P<'TypeScript-typed HTML generation.'>]>,
  ]>
>;
