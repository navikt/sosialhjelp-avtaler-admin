import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from "next";
import {
  getToken, requestAzureOboToken, requestOboToken,
  requestTokenxOboToken,
  validateAzureToken,
} from "@navikt/oasis";

type ApiHandler<Response> = (
  req: NextApiRequest,
  res: NextApiResponse<Response>,
  accessToken: string,
) => void | Promise<unknown>;

export function withAuth<Response>(
  handler: ApiHandler<Response | { message: string }>,
): ApiHandler<Response | { message: string }> {
  return async function withBearerTokenHandler(req, res) {
    if (process.env.NODE_ENV === "development") {
      return handler(req, res, "token");
    }
    const token = getToken(req);
    if (!token) {
      console.error(
        "Could not find any bearer token on the request. Denying request. This should not happen",
      );
      res.status(401).json({ message: "Access denied" });
      return;
    }

    const validation = await validateAzureToken(token);
    if (!validation.ok) {
      console.info(
        `Invalid JWT token on API request for path ${req.url} (${validation.errorType})`,
      );
      res.status(401).json({ message: "Access denied" });
      return;
    }

    return handler(req, res, token);
  };
}

type PageHandler<P> = (
  context: GetServerSidePropsContext,
  accessToken: string,
) => Promise<GetServerSidePropsResult<P>>;

export function withAuthenticatedPage<P>(handler: PageHandler<P>) {
  return async function withBearerTokenHandler(
    context: GetServerSidePropsContext,
  ): Promise<ReturnType<NonNullable<typeof handler>>> {
    if (process.env.NODE_ENV === "development") {
      return handler(context, "token");
    }
    const request = context.req;
    const bearerToken: string | null = getToken(request);

    if (!bearerToken) {
      throw new Error("Could not find any bearer token on the request.");
    }

    const tokenValidationResult = await validateAzureToken(bearerToken);
    if (!tokenValidationResult.ok) {
      console.error(
        `Invalid JWT token found (${tokenValidationResult.errorType}), redirecting to login.`,
        tokenValidationResult.error,
      );

      return {
        redirect: {
          destination: `/oauth2/login?redirect=${context.resolvedUrl}`,
          permanent: false,
        },
      };
    }

    return handler(context, bearerToken);
  };
}

export const getOboToken = async (token: string) => {
  if (process.env.NODE_ENV === "development") {
    return "token";
  }
  const targetAudience = process.env.NEXT_AVTALER_API_TARGET_AUDIENCE;
  if (!targetAudience) {
    throw new Error("Fant ikke target audience i env");
  }
  const oboToken = await requestAzureOboToken(token, targetAudience);

  if (!oboToken.ok) {
    console.error("Kunne ikke exchange obo token", oboToken.error);
    throw oboToken.error;
  }

  return oboToken.token;
};
