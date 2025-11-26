import { useState,useCallback } from "react";

export function useFetch<TRequest,TResponse>(url: string) {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (body: TRequest) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(url, {
                method: 'POST',
                headers: {

                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if(!res.ok) {
                const text = await res.text();
                throw new Error(text || `요청 실패 (status: ${res.status})`);
            }
            const json = (await res.json()) as TResponse;
            setData(json);
            return json;
        } catch (e: any){
            setError(e.message ?? "요청 중 오류 발생");
            throw e;    
        } finally {
            setLoading(false);
        }
        },
        [url],
  );
  
  return { data, loading, error, execute };
}