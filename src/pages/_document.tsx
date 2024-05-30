import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";
import { DecoratorFetchProps } from "@navikt/nav-dekoratoren-moduler";
import {
  DecoratorComponents,
  fetchDecoratorReact,
} from "@navikt/nav-dekoratoren-moduler/ssr";

interface Props {
  Decorator: DecoratorComponents;
}

const decoratorParams = (ctx: DocumentContext): DecoratorFetchProps => ({
  env: process.env.NEXT_PUBLIC_RUNTIME_ENVIRONMENT as "dev" | "prod",
  serviceDiscovery: true,
  params: {
    simple: false,
    feedback: false,
    chatbot: false,
    shareScreen: false,
    utilsBackground: "white",
    logoutUrl: undefined,
    logoutWarning: true,
  },
});

class MyDocument extends Document<Props> {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps & Props> {
    const initialProps = await Document.getInitialProps(ctx);

    const props = decoratorParams(ctx);
    const Decorator = await fetchDecoratorReact(props);

    return { ...initialProps, Decorator };
  }

  render(): React.JSX.Element {
    const { Decorator } = this.props;
    return (
      <Html>
        <Head>
          <Decorator.Styles />
          <link
            rel="preload"
            href="https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="icon"
            href="https://www.nav.no/favicon.ico"
            type="image/x-icon"
          />
        </Head>
        <body>
          <Decorator.Header />
          <Main />
          <Decorator.Footer />
          <Decorator.Scripts />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
