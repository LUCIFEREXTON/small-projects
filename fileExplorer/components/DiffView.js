import React, { useRef, useEffect } from "react"
import { DiffEditor } from "@monaco-editor/react"

const DiffView = ({ original, modified, language }) => {
	const diffEditorRef = useRef(null)

	useEffect(() => {
		if (diffEditorRef.current) {
			diffEditorRef.current.updateOptions({
				renderSideBySide: true,
				originalEditable: false,
			})
		}
	}, [diffEditorRef])

	const handleEditorDidMount = (editor) => {
		diffEditorRef.current = editor
	}

	return (
		<div className="diff-view">
			<DiffEditor
				height="100%"
				language={language}
				original={original.content}
				modified={modified.content}
				theme="vs-dark"
				onMount={handleEditorDidMount}
				options={{
					renderSideBySide: true,
					originalEditable: false,
					readOnly: true,
					minimap: { enabled: false },
					scrollBeyondLastLine: false,
					fontSize: 14,
					lineNumbers: "on",
					wordWrap: "on",
					automaticLayout: true,
					renderLineHighlight: "all",
					renderIndentGuides: true,
					scrollbar: {
						useShadows: false,
						verticalScrollbarSize: 10,
						horizontalScrollbarSize: 10,
					},
					overviewRulerBorder: false,
					diffWordWrap: "on",
					diffAlgorithm: "advanced",
					ignoreTrimWhitespace: true,
					renderIndicators: true,
					renderMarginRevertIcon: true,
					renderOverviewRuler: true,
					enableSplitViewResizing: true,
					splitViewDefaultRatio: 0.5,
					preserveViewState: true,
					diffCodeLens: true,
					codeLens: true,
					folding: true,
					foldingHighlight: true,
					foldingStrategy: "auto",
					showFoldingControls: "always",
					matchBrackets: "always",
					find: {
						addExtraSpaceOnTop: false,
						autoFindInSelection: "always",
						seedSearchStringFromSelection: "always",
					},
					links: true,
					padding: {
						top: 5,
					},
					smoothScrolling: true,
					cursorBlinking: "smooth",
					cursorSmoothCaretAnimation: true,
					mouseWheelZoom: true,
					bracketPairColorization: {
						enabled: true,
					},
				}}
			/>
		</div>
	)
}

export default DiffView
