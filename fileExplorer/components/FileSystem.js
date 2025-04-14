import React, { useState } from "react"
import FileTreeNode from "./FileTreeNode"
import { useFileSystem } from "../context/FileSystemContext"
import EditableExplorerName from "./EditableExplorerName"

const FileSystem = ({ onDiffSelect, onSelectForComparison }) => {
	const {
		fileSystem,
		addFile,
		addFolder,
		deleteNode,
		selectNode,
		toggleNode,
		deletedCount,
		deletedFiles,
		recoverFile,
		isFileModified,
		renameFile,
		explorer,
		createExplorer,
		updateExplorer,
	} = useFileSystem()
	const [expandedNodes, setExpandedNodes] = useState({})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const onToggleNode = (id, state) => {
		setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }))
		toggleNode(id, state)
	}

	const onSave = () => {
		let api, name
		if (explorer.gid) {
			api = updateExplorer
		} else {
			name = window.prompt("Enter a name for the file explorer")
			if (!name) return
			api = createExplorer
		}
		setLoading(true)
		setError(null)
		api(name).catch((err) => {
			setError(err.response?.data.message || err.message || "An error occurred")
		}).finally(() => {
			setLoading(false)
		})
	}

	const renderTree = (node) => {
		return (
			<FileTreeNode
				key={node.id}
				node={node}
				onAddFile={addFile}
				onAddFolder={addFolder}
				onDelete={deleteNode}
				onToggle={onToggleNode}
				onSelect={selectNode}
				isExpanded={expandedNodes[node.id]}
				isModified={isFileModified(node.id)}
				onDiffSelect={onDiffSelect}
				renameFile={renameFile}
				onSelectForComparison={onSelectForComparison}
			>
				{node.children &&
          expandedNodes[node.id] &&
          node.children.map(renderTree)}
			</FileTreeNode>
		)
	}

	return (
		<div className="file-system">
			<div className="file-system-header">
				<h3>
					<EditableExplorerName
						initialName={explorer.name || "Untitled"}
						fileExplorerId={explorer.gid}
					/>
				</h3>

				<button onClick={onSave}>Save{loading ? '...' : ''}</button>
			</div>
			<div className="file-system-content">
				{error ? <div className="error">{error}
					<span onClick={() => setError(null)}>x</span>
				</div> : null}
				{fileSystem.children && fileSystem.children.map(renderTree)}
			</div>
			<div className="file-system-footer">
				<button onClick={() => addFile()}>Add File</button>
				<button onClick={() => addFolder()}>Add Folder</button>
			</div>
			{deletedCount > 0 && (
				<div className="deleted-files">
					<span>Deleted files: {deletedCount}</span>
					<div className="deleted-list">
						{deletedFiles.map((file) => (
							<div key={file.id} className="deleted-item" onClick={() => selectNode(file.id)}>
								<span>{file.name}</span>
								<button onClick={() => recoverFile(file.id)}>Recover</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default FileSystem
