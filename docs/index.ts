import type {A, Body, H1, H2, H3, Div, Html, P} from '../src/html';

type PageHtml = Html<
  Body<
    [
      Div<
        Div<
          [
            H1<'html-type', {
              style: 'font-size: 4rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;'
            }>,
            P<'Type-safe HTML generation with TypeScript', {
              style: 'font-size: 1.5rem; color: #64748b; margin: 1.5rem 0 0 0; font-weight: 300;'
            }>
          ],
          {
            style: 'text-align: center; padding: 6rem 2rem;'
          }
        >,
        {
          style: 'min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);'
        }
      >,
      Div<
        [
          H2<'Features', {
            style: 'font-size: 2.5rem; font-weight: 700; text-align: center; margin: 0 0 3rem 0; color: #1e293b;'
          }>,
          Div<
            [
              Div<
                [
                  H3<'🎯 Type Safety', {
                    style: 'font-size: 1.5rem; font-weight: 600; margin: 0 0 1rem 0; color: #334155;'
                  }>,
                  P<'Full TypeScript type checking for your HTML structure. Catch errors at compile time, not runtime.', {
                    style: 'color: #64748b; line-height: 1.8; margin: 0;'
                  }>
                ],
                {
                  style: 'background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: transform 0.2s;'
                }
              >,
              Div<
                [
                  H3<'🚀 Content Model Validation', {
                    style: 'font-size: 1.5rem; font-weight: 600; margin: 0 0 1rem 0; color: #334155;'
                  }>,
                  P<'Enforce HTML5 content model rules. No more invalid nesting like divs in paragraphs.', {
                    style: 'color: #64748b; line-height: 1.8; margin: 0;'
                  }>
                ],
                {
                  style: 'background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: transform 0.2s;'
                }
              >,
              Div<
                [
                  H3<'✨ Compile-time Rendering', {
                    style: 'font-size: 1.5rem; font-weight: 600; margin: 0 0 1rem 0; color: #334155;'
                  }>,
                  P<'Transform TypeScript types directly into HTML at compile time. Zero runtime overhead.', {
                    style: 'color: #64748b; line-height: 1.8; margin: 0;'
                  }>
                ],
                {
                  style: 'background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: transform 0.2s;'
                }
              >
            ],
            {
              style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto;'
            }
          >
        ],
        {
          style: 'padding: 6rem 2rem; background: #f8fafc;'
        }
      >,
      Div<
        Div<
          [
            H2<'Get Started', {
              style: 'font-size: 2rem; font-weight: 700; margin: 0 0 1.5rem 0; color: #1e293b;'
            }>,
            P<'Build type-safe HTML with the power of TypeScript.', {
              style: 'color: #64748b; font-size: 1.125rem; margin: 0 0 2rem 0;'
            }>,
            A<'View on GitHub →', {
              href: 'https://github.com/jiko21/html-type';
              target: '_blank';
              style: 'display: inline-block; padding: 1rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 600; font-size: 1.125rem; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);'
            }>
          ],
          {
            style: 'text-align: center; max-width: 600px; margin: 0 auto;'
          }
        >,
        {
          style: 'padding: 6rem 2rem; background: white;'
        }
      >
    ],
    {
      style: 'margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;'
    }
  >
>;
