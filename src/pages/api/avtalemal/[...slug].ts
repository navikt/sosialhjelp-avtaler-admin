import type { NextApiRequest, NextApiResponse } from "next";
import { getOboToken, withAuth } from "@/auth/withAuth";
import { IncomingHttpHeaders } from "http";
import { Stream } from "stream";
import http, { RequestOptions } from "http";
import { Readable } from "node:stream";

export async function stream2buffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const buffer = Array<Uint8Array>();
    stream.on("data", (chunk) => buffer.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(buffer)));
    stream.on("error", (err) => reject(`error converting stream - ${err}`));
  });
}

const headersToSkip = ["host", "cookie", "authorization"];
export function copyHeaders(
  reqHeaders: IncomingHttpHeaders,
): IncomingHttpHeaders {
  const headers: IncomingHttpHeaders = {};
  for (const headersKey in reqHeaders) {
    if (!headersToSkip.includes(headersKey.toLowerCase())) {
      headers[headersKey] = reqHeaders[headersKey];
    }
  }
  return headers;
}

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
  try {
    const headers = {
      ...copyHeaders(req.headers),
    };
    if (oboToken) {
      headers.Authorization = `Bearer ${oboToken}`;
    }
    console.log("headers: ", headers);

    const requestOptions: RequestOptions = {
      hostname: process.env.NEXT_AVTALER_API_HOSTNAME ?? "",
      port: 80,
      path,
      method: req.method,
      headers,
    };

    console.log("requestOptions: ", requestOptions);

    const stream = Readable.from(req);
    const bodyResponse = await stream2buffer(stream);
    const backendReq = http.request(requestOptions, (proxyRequestResponse) => {
      if (proxyRequestResponse.statusCode != null) {
        res.status(proxyRequestResponse.statusCode);
      }
      console.log("response headers:", proxyRequestResponse.headers);
      for (const headersKey in proxyRequestResponse.headers) {
        const header = proxyRequestResponse.headers[headersKey];
        if (header) {
          res.setHeader(headersKey, header);
        }
      }

      proxyRequestResponse.on("readable", (data: any) => {
        while (data.read !== null) {
          console.log("readable:", data);
        }
      });
      proxyRequestResponse.on("data", (data: unknown) => {
        console.log("data:", data);
        res.write(data);
      });
      proxyRequestResponse.on("end", () => {
        console.log("end");
        res.end();
      });
    });

    backendReq.on("error", (error) => {
      console.warn("Error in proxy request:", error);
      res
        .status(500)
        .json({ message: "Error occurred while proxying the request." });
    });

    backendReq.write(bodyResponse);
    backendReq.end();
  } catch (e) {
    console.error("Noe feilet under proxying: ", e);
  }
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default withAuth(handler);
