import Document, {Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps} from "next/document";
import Decorator, {DecoratorFetchProps} from '@navikt/nav-dekoratoren-moduler'
import {DecoratorComponents, fetchDecoratorReact} from "@navikt/nav-dekoratoren-moduler/ssr";

interface Props {
  Decorator: DecoratorComponents;
}

function createDecoratorEnv(ctx: DocumentContext): "dev" | "prod" {
  switch (process.env.NEXT_PUBLIC_DEKORATOR_MILJO ?? "dev") {
    case "local":
    case "test":
    case "dev":
      return "dev";
    case "prod":
      return "prod";
    default:
      throw new Error(`Unknown runtime environment: ${process.env.DEKORATOR_MILJO}`);
  }
}


const decoratorParams = (ctx: DocumentContext): DecoratorFetchProps => ({
  env: createDecoratorEnv(ctx),
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
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & Props> {
    const initialProps = await Document.getInitialProps(ctx);

    const props = decoratorParams(ctx);
    const Decorator = await fetchDecoratorReact(props);

    return {...initialProps, Decorator};
  }

  render(): React.JSX.Element {
    const {Decorator, language} = this.props;
    return (
      <Html lang={language || "no"}>
        <Head>
          <Decorator.Styles />
          <link
            rel="preload"
            href="https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link rel="icon" href="https://www.nav.no/favicon.ico" type="image/x-icon" />
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
