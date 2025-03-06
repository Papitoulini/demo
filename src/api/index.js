import useSWR from "swr";
// import useSWRImmutable from "swr/immutable";
import ky from "ky";
import queryString from "query-string";
import constructUrl from "@iamnapo/construct-url";

const kyInstance = ky.extend({
	timeout: false,
	prefixUrl: constructUrl(import.meta.env.VITE_MAIN_SERVER_URL),
	retry: {
		statusCodes: [401, 408, 413, 429, 502, 503, 504],
		limit: 2,
		methods: ["get", "post", "put", "head", "delete", "options", "trace"],
	},
	...(import.meta.env.VITE_SENTRY_ENVIRONMENT === "develop" ? { cache: "no-store" } : {}), // This disables caching
});

const api = {
	get: (path, searchParams) => kyInstance.get(path, { searchParams: queryString.stringify(searchParams) }).json(),
	post: (path, json, searchParams) => kyInstance.post(path, { json, searchParams }).json(),
	put: (path, json, searchParams) => kyInstance.put(path, { json, searchParams }).json(),
	patch: (path, json, searchParams) => kyInstance.patch(path, { json, searchParams }).json(),
	delete: (path, json, searchParams) => kyInstance.delete(path, { json, searchParams }).json(),
};

export default api;

const is = (data, error) => ({ isLoading: !error && !data, isError: Boolean(error) });

export const useRepositories = () => {
	const url = "api/repository";
	const { data, error, mutate } = useSWR(url);
	return { repository: data, ...is(data, error), mutate };
};

export const runProcess = (selectedFiles, name = "default-name") => api.put(`api/repository`, { selectedFiles, name });
