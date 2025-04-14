import React from "react"
import MonacoEditor from "./MonacoEditor"
import DiffView from "./DiffView"
import { useFileSystem } from "../context/FileSystemContext"

const FileContent = ({ isDiffView, diffFiles, toggleDiffView }) => {
	const { selectedFile, updateFileContent } = useFileSystem()
	const handleShowDiff = () => {
		if (selectedFile && selectedFile.originalContent) {
			toggleDiffView()
		}
	}
	const getLanguage = (filename) => {
		const extension = filename.split(".").pop().toLowerCase()
		switch (extension) {
		case "js":
			return "javascript"
		case "css":
			return "css"
		case "html":
			return "html"
		case "json":
			return "json"
		case "rb":
			return "ruby"
		case "rake":
			return "ruby"
		default:
			return "plaintext"
		}
	}

	const getDiffIsExist = () => {
		if (isDiffView && diffFiles.original && diffFiles.modified) {
			return (
				<div className="file-content diff">
					<div className="file-header">
						<h3>Diff View</h3>
						<button onClick={toggleDiffView}>Close Diff</button>
					</div>
					<DiffView
						original={diffFiles.original}
						modified={diffFiles.modified}
						language={getLanguage(diffFiles.original.name)}
					/>
				</div>
			)
		}
	}

	if (!selectedFile) {
		return (
			<div className="file-content empty-state">
				<p>Select a file to view its content</p>
			</div>
		)
	}

	return (
		<div className="file-content">
			{getDiffIsExist()}
			<div className="file-header">
				<h3>{selectedFile.name}</h3>
				{selectedFile.isModified && (
					<button onClick={handleShowDiff}>Show Diff</button>
				)}
			</div>
			<MonacoEditor
				file={selectedFile}
				content={selectedFile.content}
				language={getLanguage(selectedFile.name)}
				onChange={(newContent) =>
					updateFileContent(selectedFile.id, newContent)
				}
			/>
		</div>
	)
}

export default FileContent
