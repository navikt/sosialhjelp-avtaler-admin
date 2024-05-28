// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Avtale = {
  name: string;
  document: File;
  published: boolean;
};

const AVTALER_API_URL = "localhost:9090/sosialhjelp/avtaler-api/api/avtalemal"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Avtale[]>,
) {
  const thingy = await fetch(AVTALER_API_URL)
  const json = await thingy.json()
  res.status(200).json(json);
}
