import { useRouter } from "next/router";

const useMutations = () => {
  const post = usePost();
  const doDelete = useDelete();
  const createAvtalemal = async (formData: FormData) =>
    post({
      url: "/sosialhjelp/avtaler-admin/api/avtalemal/sosialhjelp/avtaler-api/api/avtalemal",
      body: formData,
      onError: (response) =>
        console.error(
          "Failed to create avtalemal, status: ",
          response.status,
          " - ",
          response.statusText,
        ),
    });

  const publishAvtalemal = async (uuid: string) => {
    return post({
      url: `/sosialhjelp/avtaler-admin/api/avtalemal/sosialhjelp/avtaler-api/api/avtalemal/${uuid}/publiser`,
      onError: (response) => {
        console.error(
          "Failed to publish avtalemal, status: ",
          response.status,
          " - ",
          response.statusText,
        );
      },
    });
  };

  const deleteAvtalemal = async (uuid: string) => {
    return doDelete({
      url: `/sosialhjelp/avtaler-admin/api/avtalemal/sosialhjelp/avtaler-api/api/avtalemal/${uuid}`,
      onError: (response) => {
        console.error(
          "Failed to delete avtalemal, status: ",
          response.status,
          " - ",
          response.statusText,
        );
      },
    });
  };
  return { createAvtalemal, publishAvtalemal, deleteAvtalemal };
};

interface Params {
  url: string;
  onError: (response: Response) => void;
  onSuccess?: (response: Response) => void;
  body?: BodyInit | null | undefined;
}

const usePost = () => {
  const router = useRouter();
  return async ({
    url,
    onError,
    onSuccess = async () => {
      await router.replace(router.asPath);
    },
    body,
  }: Params) => {
    const response = await fetch(url, {
      method: "POST",
      body,
    });
    if (response.status < 300) {
      onSuccess(response);
    } else {
      onError(response);
    }
  };
};

const useDelete = () => {
  const router = useRouter();
  return async ({
    url,
    onError,
    onSuccess = async () => {
      await router.replace(router.asPath);
    },
  }: Params) => {
    const response = await fetch(url, {
      method: "DELETE",
    });
    if (response.status < 300) {
      onSuccess(response);
    } else {
      onError(response);
    }
  };
};

export default useMutations;
