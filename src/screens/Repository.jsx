import { useState, memo, useMemo } from "react";
import { ToggleButton, Box, Button, Typography, Grid, TextField } from "@mui/material";
import {
	Pageview,
	FileCopy,
	BarChart,
	Shield,
	Security,
	ErrorOutlineRounded,
	Check,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import { useDocumentTitle, useSnackbar } from "#utils";
import { useRepositories, runProcess } from "#api";
import DataTable from "../components/DataTable.jsx";

const Repositories = () => {
	const navigate = useNavigate();
	const { error } = useSnackbar();
	const { search, pathname } = useLocation();
	const { repository = {}, isError: isErrorRepositories, isLoading } = useRepositories();
	const [selected, setSelected] = useState([]);
	const [pipelineName, setPipelineName] = useState("");
	const theme = useTheme();

	// Set document title using our custom hook.
	useDocumentTitle("Papitoulini/juice-shop");

	// Define table columns.
	const tableColumns = useMemo(
		() => [
			{
				field: "File Name",
				minWidth: 170,
				valueGetter: ({ row }) => {
					if (row.isHeader) {
						return null;
					}
					return row.path;
				},
			},
			{
				field: "Code Vulnerabilities",
				flex: 1,
				sortable: false,
				align: "left",
				// Show a summary in the main row.
				valueGetter: ({ row }) => {
					if (row.isHeader) {
						return (
							<Grid container sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
								<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
									{"Minor"}
								</Grid>
								<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
									{"Major"}
								</Grid>
								<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
									{"Critical"}
								</Grid>
								<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
									{"Total"}
								</Grid>
							</Grid>
						);
					}
					return (
						<Grid container sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
							<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
								{row.fileSastSummary?.INFO || 0}
							</Grid>
							<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
								{row.fileSastSummary?.WARNING || 0}
							</Grid>
							<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
								{row.fileSastSummary?.ERROR || 0}
							</Grid>
							<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
								{row.fileSastSummary?.TOTAL || 0}
							</Grid>
						</Grid>
					);
				},
			},
			{
				field: "Violations",
				flex: 1,
				sortable: false,
				align: "left",
				// Show a summary in the main row.
				valueGetter: ({ row }) => {
					if (row.isHeader) {
						return (
							<Grid container sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
								<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
									{"Minor"}
								</Grid>
								<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
									{"Major"}
								</Grid>
								<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
									{"Critical"}
								</Grid>
								<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
									{"Total"}
								</Grid>
							</Grid>
						);
					}
					return (
						<Grid container sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
							<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
								{row.fileViolationsSummary?.Minor || 0}
							</Grid>
							<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
								{row.fileViolationsSummary?.Major || 0}
							</Grid>
							<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
								{row.fileViolationsSummary?.Critical || 0}
							</Grid>
							<Grid item sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
								{row.fileViolationsSummary?.Total || 0}
							</Grid>
						</Grid>
					);
				},
			},
			{
				field: "Actions",
				flex: 0.5,
				sortable: false,
				align: "center",
				valueGetter: ({ row }) => {
					if (row.isHeader) {
						return null;
					}
					return (
						<ToggleButton
							value="check"
							selected={selected.includes(row.path)}
							onChange={() =>
								setSelected((prevSelected) =>
									prevSelected.includes(row.path)
										? prevSelected.filter((p) => p !== row.path)
										: [...prevSelected, row.path]
								)
							}
						>
							<Check />
						</ToggleButton>
					);
				},
			},
		],
		[selected]
	);

	// Detail panel to render a subtable with severity details.
	const getDetailPanelContent = (row) => {
		return (
			<Box sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
				<Typography variant="subtitle1" gutterBottom>
					Violations Details
				</Typography>
				<Box component="table" sx={{ width: "100%", mb: 2, borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>
								Severity
							</th>
							<th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>
								Count
							</th>
						</tr>
					</thead>
					<tbody>
						{row.fileSastSummary && Object.entries(row.fileSastSummary).length > 0 ? (
							Object.entries(row.fileSastSummary).map(([severity, count]) => (
								<tr key={severity}>
									<td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{severity}</td>
									<td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{count}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={2} style={{ padding: "0.5rem" }}>
									No violations details available.
								</td>
							</tr>
						)}
					</tbody>
				</Box>
				<Typography variant="subtitle1" gutterBottom>
					Code Vulnerabilities Details
				</Typography>
				<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>
								Severity
							</th>
							<th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>
								Count
							</th>
						</tr>
					</thead>
					<tbody>
						{row.fileViolationsSummary && Object.entries(row.fileViolationsSummary).length > 0 ? (
							Object.entries(row.fileViolationsSummary).map(([severity, count]) => (
								<tr key={severity}>
									<td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{severity}</td>
									<td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{count}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={2} style={{ padding: "0.5rem" }}>
									No vulnerabilities details available.
								</td>
							</tr>
						)}
					</tbody>
				</Box>
			</Box>
		);
	};

	const modifiedRows = useMemo(() => {
		const restCom = [...(repository.files || [])];
		const headerRow = {
			id: "headerRow", // Ensure this ID is unique and won't clash with real data IDs
			isHeader: true, // This is a pseudo-header row
			commitMessage: "Commit Message",
			author: "Author",
			maintainability: "Maintainability", // You can include whatever header labels you need
			security: "Security",
			readability: "Readability",
			reusability: "Reusability",
		};
		return [headerRow, ...restCom];
	}, [repository.files]);

	return (
		<section style={{ paddingTop: "1rem" }}>
			<div
				className="container"
				style={{
					margin: "0 auto",
					maxWidth: 1200,
					padding: "0 1rem",
					background: theme.palette.background.paper,
				}}
			>
				{/* Pipeline Name Input & Run Pipeline Button */}
				<Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
					<TextField
						label="Pipeline Name"
						value={pipelineName}
						onChange={(e) => setPipelineName(e.target.value)}
						variant="outlined"
						size="small"
						sx={{ marginRight: 2 }}
					/>
					<Button
						variant="outlined"
						size="medium"
						color="epic"
						onClick={async () => {
							// Run process with selected files and pipeline name
							await runProcess(selected, pipelineName);
						}}
					>
						Run Pipeline
					</Button>
				</Box>
				<DataTable
					color="pink.main"
					title="Added Files"
					rows={modifiedRows || []}
					columns={tableColumns}
					// Use file path as the unique row identifier.
					getRowId={(row) => row.path || row.id}
					// Provide the detail panel content to render a second subtable row.
					getDetailPanelContent={getDetailPanelContent}
					initialState={{
						sorting: { sortModel: [{ field: "File Name", sort: "asc" }] },
						pagination: { paginationModel: { page: 0 } },
					}}
				/>
			</div>
		</section>
	);
};

export default memo(Repositories);
