import { createWithEqualityFn } from "zustand/traditional";

export default createWithEqualityFn((setState) => ({
	name: "",
	setName: (name) => setState({ name }),
	repoName: "",
	setRepoName: (repoName) => setState({ repoName }),
	language: "",
	setLanguage: (language) => setState({ language }),
	root: "",
	setRoot: (root) => setState({ root }),
	csProjects: "",
	setCsProjects: (csProjects) => setState({ csProjects }),
	repoOwner: "",
	setRepoOwner: (repoOwner) => setState({ repoOwner }),
	userName: "",
	setUserName: (userName) => setState({ userName }),
	showGlobalLoading: false,
	setShowGlobalLoading: (showGlobalLoading) => setState({ showGlobalLoading }),
	branchName: "",
	setBranchName: (branchName) => setState({ branchName }),
	fileName: "",
	setFileName: (fileName) => setState({ fileName }),
	qualityViolations: {
		Category: "",
		Critical: true,
		Major: true,
		Minor: true,
	},
	setQualityViolations: (qualityViolations) => setState({ qualityViolations }),
	qualityVulnerabilities: {
		category: "",
		critical: true,
		high: true,
		moderate: true,
		low: true,
	},
	setQualityVulnerabilities: (qualityVulnerabilities) => setState({ qualityVulnerabilities }),
	qualitySast: {
		category: "",
		INFO: false,
		WARNING: true,
		ERROR: true,
	},
	setQualitySast: (qualitySast) => setState({ qualitySast }),
}));
