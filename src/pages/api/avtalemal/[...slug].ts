import type { NextApiRequest, NextApiResponse } from "next";
import { getOboToken, withAuth } from "@/auth/withAuth";
import { proxyApiRouteRequest } from "@navikt/next-api-proxy";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
  token: string,
) => {
  const { slug } = req.query;
  console.log("slug: ", slug);
  if (!slug) {
    res.status(400).json({ message: "Manglende path" });
    return;
  }
  const path = Array.isArray(slug) ? slug.join("/") : slug;

  const oboToken = await getOboToken(token);
  console.log("path: ", oboToken);
  console.log(
    "proxying request to: http://",
    process.env.NEXT_AVTALER_API_HOSTNAME ?? "",
    "/",
    path,
  );
  try {
    await proxyApiRouteRequest({
      req,
      res,
      bearerToken: oboToken,
      hostname: process.env.NEXT_AVTALER_API_HOSTNAME ?? "",
      path: path as string,
      https: false,
    });
  } catch (e) {
    console.error("Noe feilet under proxying: " ,e);
  }
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default withAuth(handler);
