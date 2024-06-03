import type { NextApiRequest, NextApiResponse } from "next";
import { getOboToken, withAuth } from "@/auth/withAuth";
import { proxyApiRouteRequest } from "@navikt/next-api-proxy";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
  token: string,
) => {
  const { slug } = req.query;
  if (!slug) {
    res.status(400).json({ message: "Manglende path" });
    return;
  }
  const path = "/" + (Array.isArray(slug) ? slug.join("/") : slug);

  const oboToken = await getOboToken(token);
  await proxyApiRouteRequest({
    req,
    res,
    bearerToken: oboToken,
    hostname: process.env.NEXT_AVTALER_API_HOSTNAME ?? "",
    path: path as string,
    https: false,
  });
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default withAuth(handler);
