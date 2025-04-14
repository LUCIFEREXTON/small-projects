import React, { useState } from "react"
import FileContent from "./components/FileContent"
import FileSystem from "./components/FileSystem"
import { useFileSystem } from "./context/FileSystemContext"

const Main = () => {
	const { selectedFile } = useFileSystem()

	// New state for diff view
	const [isDiffView, setIsDiffView] = useState(false)
	const [diffFiles, setDiffFiles] = useState({
		original: null,
		modified: null,
	})

	// Function to toggle diff view
	const toggleDiffView = () => {
		setIsDiffView((prev) => !prev)
		if (!isDiffView && selectedFile && selectedFile.isModified) {
			setDiffFiles({
				original: { ...selectedFile, content: selectedFile.originalContent },
				modified: selectedFile,
			})
		} else {
			setDiffFiles({ original: null, modified: null })
		}
	}

	const onDiffSelect = (node) => {
		setDiffFiles({
			original: { ...node, content: node.originalContent },
			modified: node,
		})
		setIsDiffView(true)
	}

	// Function to select files for comparison
	const selectFileForComparison = (file) => {
		if (!diffFiles.original) {
			setDiffFiles({ ...diffFiles, original: file })
		} else if (!diffFiles.modified) {
			setDiffFiles({ ...diffFiles, modified: file })
			setIsDiffView(true)
		} else {
			// If both files are already selected, reset and start over
			setDiffFiles({ original: file, modified: null })
		}
	}

	return <div className="app">
		<div className="file-explorer">
			<FileSystem
				onSelectForComparison={selectFileForComparison}
				onDiffSelect={onDiffSelect}
			/>
		</div>
		<div className="file-content">
			<FileContent
				isDiffView={isDiffView}
				diffFiles={diffFiles}
				toggleDiffView={toggleDiffView}
			/>
		</div>
	</div>
}

export default Main
