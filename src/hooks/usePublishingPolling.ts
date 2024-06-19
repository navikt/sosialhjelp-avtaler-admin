import useSWR from "swr";

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

const usePublishingPolling = (enabled: boolean, uuid: string | null) => {
  const { data, error, isLoading } = useSWR<Publisering[]>(
    enabled && uuid ? `/sosialhjelp/avtaler-admin/api/avtalemal/sosialhjelp/avtaler-api/api/avtalemal/${uuid}/publiser/status` : null,
    fetcher,
    { refreshInterval: 500, },
  );
  return { data, error, isLoading };
};

export default usePublishingPolling;
