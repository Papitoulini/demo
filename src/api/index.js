import useSWR from "swr";
// import useSWRImmutable from "swr/immutable";
import ky from "ky";
import queryString from "query-string";
import constructUrl from "@iamnapo/construct-url";

import { jwt } from "#utils";

const kyInstance = ky.extend({
	timeout: false,
	prefixUrl: constructUrl(import.meta.env.VITE_MAIN_SERVER_URL),
	retry: {
		statusCodes: [401, 408, 413, 429, 502, 503, 504],
		limit: 2,
		methods: ["get", "post", "put", "head", "delete", "options", "trace"],
	},
	hooks: {
		beforeRequest: [(request) => {
			const token = jwt.getToken();
			const refreshToken = jwt.getRToken();
			if (token) request.headers.set("x-access-token", token);
			if (refreshToken) request.headers.set("x-refresh-token", refreshToken);
		}],
	},
	...(import.meta.env.VITE_SENTRY_ENVIRONMENT === "develop" ? { cache: "no-store" } : {}), // This disables caching
});

const rootApi = kyInstance.extend({
	hooks: {
		beforeRetry: [
			async ({ request: { method }, error }) => {
				if (error?.response?.status === 401) {
					const res = await kyInstance.extend({ throwHttpErrors: false, retry: 0 }).get("api/refresh");
					if (res.status === 401) {
						jwt.destroyTokens();
						globalThis.location.href = "/";
					} else {
						const { token } = await res.json();
						jwt.setToken(token);
					}
				} else if (method === "POST") {
					throw error;
				}
			},
		],
	},
});

const api = {
	get: (path, searchParams) => rootApi.get(path, { searchParams: queryString.stringify(searchParams) }).json(),
	post: (path, json, searchParams) => rootApi.post(path, { json, searchParams }).json(),
	put: (path, json, searchParams) => rootApi.put(path, { json, searchParams }).json(),
	patch: (path, json, searchParams) => rootApi.patch(path, { json, searchParams }).json(),
	delete: (path, json, searchParams) => rootApi.delete(path, { json, searchParams }).json(),
};

export default api;

const is = (data, error) => ({ isLoading: !error && !data, isError: Boolean(error) });

export const useRepositories = () => {
	const url = "api/repository";
	const { data, error, mutate } = useSWR(url);
	return { repository: data, ...is(data, error), mutate };
};

export const runProcess = (selectedFiles, name = "default-name") => api.put(`api/repository`, { selectedFiles, name });
