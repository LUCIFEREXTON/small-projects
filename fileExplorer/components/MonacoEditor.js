import React from "react"
import Editor from "@monaco-editor/react"

const MonacoEditor = ({ file, content, language, onChange }) => {
	const handleEditorChange = (value) => {
		onChange(value)
	}

	return (
		<div className="monaco-editor-wrapper">
			<Editor
				height="100%"
				language={language}
				value={content || ''}
				theme="vs-dark"
				onChange={handleEditorChange}
				loading="Loading..."
				path={file.path}
				options={{
					minimap: { enabled: true },
					scrollBeyondLastLine: false,
					fontSize: 14,
					lineNumbers: "on",
					readOnly: file.deleted,
					wordWrap: "on",
					automaticLayout: true,
					suggestOnTriggerCharacters: true,
					hideCursorInOverviewRuler: true,
					highlightActiveIndentGuide: true,
					renderLineHighlight: "all",
					renderIndentGuides: true,
					scrollbar: {
						useShadows: false,
						verticalScrollbarSize: 10,
						horizontalScrollbarSize: 10,
					},
					overviewRulerBorder: false,
					guides: {
						indentation: true,
					},
					contextmenu: true,
					quickSuggestions: true,
					acceptSuggestionOnEnter: "on",
					tabCompletion: "on",
					parameterHints: {
						enabled: true,
					},
					folding: true,
					renderControlCharacters: true,
					renderWhitespace: "none",
					trimAutoWhitespace: true,
					smoothScrolling: true,
					saveViewState: true,
				}}
			/>
		</div>
	)
}

export default MonacoEditor
