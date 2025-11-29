import type {Body, H1, Div, Html, Img, P} from '../src/html';

type PageHtml = Html<
  Body<[
    H1<'Hello'>,
    Div<[P<'This is a page of html-type.'>]>,
    Div<[P<'TypeScript-typed HTML generation.'>]>,
    Img<{ src: './img.png'}>
  ]>
>;
